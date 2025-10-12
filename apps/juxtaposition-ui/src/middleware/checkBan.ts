import moment from 'moment';
import { config } from '@/config';
import { SETTINGS } from '@/models/settings';
import type { RequestHandler } from 'express';

export const checkBan: RequestHandler = async (request, response, next) => {
	// Initialize access levels so the template engine can always access them
	response.locals.tester = false;
	response.locals.moderator = false;
	response.locals.developer = false;

	const account = response.locals.account;
	if (!account) {
		if (request.guest_access || request.path === '/login') {
			return next();
		} else {
			return response.status(401).send('Ban Check Failed: No user or guest access');
		}
	}

	// Set access levels
	response.locals.tester = account.pnid.accessLevel >= 1 && account.pnid.accessLevel <= 3;
	response.locals.moderator = account.pnid.accessLevel == 2 || account.pnid.accessLevel == 3;
	response.locals.developer = account.pnid.accessLevel == 3;

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
			return response.render('web/login.ejs', { toast: 'No access. Must be tester or dev', redirect: request.originalUrl });
		} else {
			return response.render('portal/partials/ban_notification.ejs', {
				user: null,
				error: 'No access. Must be tester or dev'
			});
		}
	}
	if (account.settings && moment(account.settings.ban_lift_date) <= moment() && account.settings.account_status !== 3) {
		await SETTINGS.findOneAndUpdate({
			pid: account.settings.pid
		}, {
			account_status: 0
		});
		account.settings.account_status = 0;
	}
	// This includes ban checks for both Juxt specifically and the account server, ideally this should be squashed
	// assuming we support more gradual bans on PNID's
	if (account.settings && (account.settings.account_status < 0 || account.settings.account_status > 1 || account.pnid.accessLevel < 0)) {
		if (request.directory === 'web') {
			let banMessage = '';
			switch (account.settings.account_status) {
				case 2:
					banMessage = `${account.pnid.username} has been banned for ${moment(account.settings.ban_lift_date).fromNow(true)}. \n\nReason: ${account.settings.ban_reason}. \n\nIf you have any questions contact the moderators in the Discord server or forum.`;
					break;
				case 3:
					banMessage = `${account.pnid.username} has been banned forever. \n\nReason: ${account.settings.ban_reason}. \n\nIf you have any questions contact the moderators in the Discord server or forum.`;
					break;
				default:
					banMessage = `${account.pnid.username} has been banned. \n\nIf you have any questions contact the moderators in the Discord server or forum.`;
			}
			return response.render('web/login.ejs', { toast: banMessage, redirect: request.originalUrl });
		} else {
			return response.render(request.directory + '/partials/ban_notification.ejs', {
				user: account.settings,
				moment: moment,
				PNID: account.pnid.username,
				networkBan: account.pnid.accessLevel < 0
			});
		}
	}

	if (account.settings) {
		await SETTINGS.findOneAndUpdate({
			pid: account.settings.pid
		}, {
			last_active: new Date()
		});
	}

	next();
};
