import { getUserSettings } from '@/api/settings';
import { config } from '@/config';
import { logger } from '@/logger';
import { decodeParamPack, getPIDFromServiceToken, getUserAccountData, getUserDataFromToken, processLanguage } from '@/util';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { RequestHandler } from 'express';

export const consoleAuth: RequestHandler = async (request, response, next) => {
	const serviceToken = request.get('x-nintendo-servicetoken');
	request.tokens = { serviceToken };

	// Service token auth
	let pnid: GetUserDataResponse | null = null;
	// Always auth for guests or write requests
	if (!request.session.pnid || request.isWrite) {
		const pid = serviceToken ? getPIDFromServiceToken(serviceToken) : null;

		if (pid !== null) {
			pnid = await getUserAccountData(pid);
		}
		// Cache auth result
		request.session.pnid = pnid;
	} else {
		// Use the cache
		pnid = request.session.pnid;
	}

	// OAuth token dev auth
	if (!pnid) {
		try {
			// Developer accounts may also use an OAuth token for console frontends
			const tokenUser = await getUserDataFromToken(request.cookies.access_token);
			if (tokenUser.accessLevel === 3) {
				pnid = await getUserAccountData(tokenUser.pid);
				request.tokens = { oauthToken: request.cookies.access_token };
			}
		} catch (e) {
			logger.error(e, 'Failed to authenticate user from access token');
			pnid = null;
		}
	}

	if (!pnid) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Unable to parse service token. Are you using a Nintendo Network ID?'
		});
	}

	// Populate account
	response.locals.account = {
		pnid,
		settings: await getUserSettings(request.tokens),
		moderator: accountIsModerator(pnid)
	};
	// Populate legacy stuff
	request.pid = pnid.pid;
	request.user = pnid;

	// Set headers
	const ppack = request.get('x-nintendo-parampack');
	request.paramPackData = ppack ? decodeParamPack(ppack) : null;
	response.header('X-Nintendo-WhiteList', config.whitelist);

	// This section includes checks if a user is a developer and adds exceptions for these cases
	if (pnid.accessLevel < 3 && !request.paramPackData) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Missing auth headers'
		});
	}
	const userAgent = request.get('user-agent') ?? '';
	const uaIsConsole = userAgent.includes('Nintendo WiiU') || userAgent.includes('Nintendo 3DS');
	if (pnid.accessLevel < 3 && (request.cookies.access_token || !uaIsConsole)) {
		return response.render('portal/partials/ban_notification.ejs', {
			user: null,
			error: 'Invalid authentication method used.'
		});
	}

	response.locals.uaIsConsole = uaIsConsole;
	response.locals.lang = processLanguage(request.paramPackData);
	response.locals.pid = request.pid;
	return next();
};

function accountIsModerator(pnid: GetUserDataResponse): boolean {
	// AL2 can always moderate...
	if (pnid.accessLevel >= 2) {
		return true;
	}

	// Lower-level accounts can also have permission granted
	if (pnid.permissions?.moderateMiiverse === true) {
		return true;
	}

	return false;
}
