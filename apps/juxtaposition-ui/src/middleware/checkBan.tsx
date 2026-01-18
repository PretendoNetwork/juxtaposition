import moment from 'moment';
import { database as db } from '@/database';
import { config } from '@/config';
import { humanDate, humanFromNow } from '@/util';
import { WebLoginView } from '@/services/juxt-web/views/web/loginView';
import { buildContext } from '@/services/juxt-web/views/context';
import { CtrFatalErrorView } from '@/services/juxt-web/views/ctr/errorView';
import { PortalFatalErrorView } from '@/services/juxt-web/views/portal/errorView';
import type { RequestHandler } from 'express';

export const checkBan: RequestHandler = async (request, response, next) => {
	// Initialize access levels so the template engine can always access them
	response.locals.tester = false;
	response.locals.moderator = false;
	response.locals.developer = false;

	if (!request.user) {
		if (request.guest_access || request.path === '/login') {
			return next();
		} else {
			return response.status(401).send('Ban Check Failed: No user or guest access');
		}
	}

	// Set access levels
	response.locals.tester = request.user.accessLevel >= 1 && request.user.accessLevel <= 3;
	response.locals.moderator = request.user.accessLevel == 2 || request.user.accessLevel == 3;
	response.locals.developer = request.user.accessLevel == 3;

	// Check if user has access to the environment
	let accessAllowed = false;
	switch (config.serverEnvironment) {
		case 'dev':
			accessAllowed = response.locals.developer;
			break;
		case 'test':
			accessAllowed = response.locals.tester || response.locals.moderator || response.locals.developer;
			break;
		case 'prod':
			accessAllowed = true;
			break;
		default:
			accessAllowed = false;
	}

	if (!accessAllowed) {
		response.status(500);
		if (request.directory === 'web') {
			return response.jsx(<WebLoginView ctx={buildContext(response)} toast="No access. Must be tester or dev" redirect={request.originalUrl} />);
		} else {
			return response.jsx(<PortalFatalErrorView code={5989999} message="No access. Must be tester or dev" />);
		}
	}
	const userSettings = await db.getUserSettings(request.pid);
	if (userSettings && moment(userSettings.ban_lift_date) <= moment() && userSettings.account_status !== 3) {
		userSettings.account_status = 0;
		await userSettings.save();
	}
	// This includes ban checks for both Juxt specifically and the account server, ideally this should be squashed
	// assuming we support more gradual bans on PNID's
	if (userSettings && (userSettings.account_status < 0 || userSettings.account_status > 1 || request.user.accessLevel < 0)) {
		let banMessage = '';
		let banCode = 5980020;
		switch (userSettings.account_status) {
			case 2:
				banMessage = `${request.user.username} has been banned. The ban ends ${humanFromNow(userSettings.ban_lift_date)} (at ${humanDate(userSettings.ban_lift_date)}).`;
				banCode = 5980010;
				break;
			case 3:
				banMessage = `${request.user.username} has been permanently banned.`;
				banCode = 5980011;
				break;
			default:
				banMessage = `${request.user.username} has been banned.`;
		}
		if (request.user.accessLevel < 0) {
			banMessage += '\n\nThis ban restricts all parts of Pretendo Network.';
		} else if (userSettings.ban_reason) {
			banMessage += `\n\nReason: ${userSettings.ban_reason}.`;
		}
		banMessage += `\n\nIf you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).`;

		if (request.directory === 'web') {
			return response.jsx(<WebLoginView ctx={buildContext(response)} toast={banMessage} redirect={request.originalUrl} />);
		} else {
			return response.jsxForDirectory({
				portal: <PortalFatalErrorView code={banCode} message={banMessage} />,
				ctr: <CtrFatalErrorView code={banCode} message={banMessage} />
			});
		}
	}

	if (userSettings) {
		userSettings.last_active = new Date();
		await userSettings.save();
	}

	next();
};
