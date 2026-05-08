import { config } from '@/config';
import { humanDate, humanFromNow } from '@/util';
import { WebLoginView } from '@/services/juxt-web/views/web/loginView';
import { CtrFatalErrorView } from '@/services/juxt-web/views/ctr/errorView';
import { PortalFatalErrorView } from '@/services/juxt-web/views/portal/errorView';
import type { RequestHandler } from 'express';

export const checkBan: RequestHandler = async (request, response, next) => {
	// Set access levels
	response.locals.tester = request.self?.permissions.tester ?? null;
	response.locals.moderator = request.self?.permissions.moderator ?? null;
	response.locals.developer = request.self?.permissions.developer ?? null;

	if (!request.user) {
		if (request.guest_access || request.path === '/login') {
			return next();
		} else {
			return response.status(401).send('Ban Check Failed: No user or guest access');
		}
	}

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
		const banMessage = 'No access. Must be tester or dev';
		const banCode = 5989999;
		return response.jsxForDirectory({
			web: <WebLoginView toast={banMessage} redirect={request.originalUrl} />,
			portal: <PortalFatalErrorView code={banCode} message={banMessage} />,
			ctr: <CtrFatalErrorView code={banCode} message={banMessage} />
		});
	}

	if (request.self?.banState) {
		const banState = request.self.banState;
		const endDateMessage = banState.endDate ? ` The ban ends ${humanFromNow(banState.endDate)} (at ${humanDate(banState.endDate)}).` : '';

		let banCode = 5980020; // fallback
		let banMessage = `${request.self.username} has been banned.${endDateMessage}`; // fallback
		if (banState.code === 'temp_ban') {
			banMessage = `${request.self.username} has been banned.${endDateMessage}`;
			banCode = 5980010;
		} else if (banState.code === 'perma_ban') {
			banMessage = `${request.user.username} has been permanently banned.${endDateMessage}`;
			banCode = 5980011;
		} else if (banState.code === 'network_ban') {
			banMessage = `${request.user.username} has been permanently banned.${endDateMessage}`;
			banMessage += `\n\nThis ban restricts all parts of Pretendo Network.`;
			banCode = 5980020;
		}

		if (banState.reason) {
			banMessage += `\n\nReason: ${banState.reason}.`;
		}

		banMessage += `\n\nIf you have any questions, please contact the moderators on the Pretendo Network Forum (https://preten.do/ban-appeal/).`;

		return response.jsxForDirectory({
			web: <WebLoginView toast={banMessage} redirect={request.originalUrl} />,
			portal: <PortalFatalErrorView code={banCode} message={banMessage} />,
			ctr: <CtrFatalErrorView code={banCode} message={banMessage} />
		});
	}

	next();
};
