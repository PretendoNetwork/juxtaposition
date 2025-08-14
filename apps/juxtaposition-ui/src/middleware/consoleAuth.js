import * as util from "@/util";
import { config } from "@/config";
import { logger } from "@/logger";

async function auth(request, response, next) {
	// Get pid and fetch user data
	if (request.session && request.session.user && request.session.pid && !request.isWrite) {
		request.user = request.session.user;
		request.pid = request.session.pid;
		request.tokens = request.session.tokens;
	} else {
		request.tokens = { serviceToken: request.headers['x-nintendo-servicetoken'] };
		request.pid = request.headers['x-nintendo-servicetoken'] ? await util.getPIDFromServiceToken(request.headers['x-nintendo-servicetoken']) : null;
		request.user = request.pid ? await util.getUserAccountData(request.pid) : null;

		request.session.user = request.user;
		request.session.pid = request.pid;
		request.session.tokens = request.tokens;
	}

	// Set headers
	request.paramPackData = request.headers['x-nintendo-parampack'] ? util.decodeParamPack(request.headers['x-nintendo-parampack']) : null;
	response.header('X-Nintendo-WhiteList', config.whitelist);

	if (!request.user) {
		try {
			request.user = await util.getUserDataFromToken(request.cookies.access_token);
			request.pid = request.user.pid;

			request.session.user = request.user;
			request.session.pid = request.pid;
			if (request.user.accessLevel !== 3) {
				request.user = null;
				request.pid = null;
				request.session.user = null;
				request.session.pid = null;
			}
		} catch (e) {
			logger.error(e, 'Failed to authenticate user from access token');
			request.user = null;
			request.pid = null;
		}
	}

	// This section includes checks if a user is a developer and adds exceptions for these cases
	if (!request.pid) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to parse service token. Are you using a Nintendo Network ID?'
		});
	}
	if (!request.user) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to fetch user data. Please try again later.'
		});
	}
	if (request.user.accessLevel < 3 && !request.paramPackData) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Missing auth headers'
		});
	}
	const userAgent = request.headers['user-agent'];
	if (request.user.accessLevel < 3 && (request.cookies.access_token || (!userAgent.includes('Nintendo WiiU') && !userAgent.includes('Nintendo 3DS')))) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Invalid authentication method used.'
		});
	}

	response.locals.lang = util.processLanguage(request.paramPackData);
	response.locals.pid = request.pid;
	return next();
}

export default auth;
