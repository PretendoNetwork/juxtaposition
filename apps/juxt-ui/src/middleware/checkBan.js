const moment = require('moment/moment');
const config = require('../../config.json');
const db = require('../database');

async function checkBan(request, response, next) {
	// Initialize access levels so the template engine can always access them
	response.locals.tester = false;
	response.locals.moderator = false;
	response.locals.developer = false;

	if (!request.user && !request.guest_access && request.path !== '/login') {
		return response.status(401).send('Ban Check Failed: No user or guest access');
	} else if (!request.user && (request.guest_access || request.path === '/login')) {
		return next();
	}

	// Set access levels
	response.locals.tester = request.user.accessLevel >= 1 && request.user.accessLevel <= 3;
	response.locals.moderator = request.user.accessLevel == 2 || request.user.accessLevel == 3;
	response.locals.developer = request.user.accessLevel == 3;

	// Check if user has access to the environment
	let accessAllowed = false;
	switch (config.server_environment) {
		case 'dev':
			accessAllowed = request.developer;
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
			return response.render('web/login.ejs', { toast: 'No access. Must be tester or dev' });
		} else {
			return response.render('portal/partials/ban_notification.ejs', {
				user: null,
				error: 'No access. Must be tester or dev'
			});
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
		if (request.directory === 'web') {
			let banMessage = '';
			switch (userSettings.account_status) {
				case 2:
					banMessage = `${request.user.username} has been banned until: ${moment(userSettings.ban_lift_date)}. \n\nReason: ${userSettings.ban_reason}. \n\nIf you have any questions contact the moderators in the Discord server or forum.`;
					break;
				case 3:
					banMessage = `${request.user.username} has been banned forever. \n\nReason: ${userSettings.ban_reason}. \n\nIf you have any questions contact the moderators in the Discord server or forum.`;
					break;
				default:
					banMessage = `${request.user.username} has been banned. \n\nIf you have any questions contact the moderators in the Discord server or forum.`;
			}
			return response.render('web/login.ejs', { toast: banMessage });
		} else {
			return response.render(request.directory + '/partials/ban_notification.ejs', {
				user: userSettings,
				moment: moment,
				PNID: request.user.username,
				networkBan: request.user.accessLevel < 0
			});
		}
	}

	if (userSettings) {
		userSettings.last_active = Date.now();
		await userSettings.save();
	}

	next();
}

module.exports = checkBan;
