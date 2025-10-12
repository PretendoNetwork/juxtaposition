import { getUserSettings } from '@/api/settings';
import { config } from '@/config';
import { accountIsModerator, getUserAccountData, getUserDataFromToken } from '@/util';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { RequestHandler, Request } from 'express';

const cookieDomain = config.http.cookieDomain;

export const webAuth: RequestHandler = async (request, response, next) => {
	const oauthToken = request.cookies.access_token;
	request.tokens = { oauthToken };

	// OAuth token auth
	let pnid: GetUserDataResponse | null = null;
	// Always auth for guests or write requests
	if (!request.session.pnid || request.isWrite || !request.cookies.access_token) {
		const pid = await getUserDataFromToken(request.cookies.access_token).then(tokenUser => tokenUser.pid, _rej => null);

		if (pid !== null) {
			pnid = await getUserAccountData(pid);
		}

		// Cache auth result
		request.session.pnid = pnid;
	} else {
		// Use the cache
		pnid = request.session.pnid;
	}

	// clear cookies and stuff
	if (!pnid && request.path !== '/login') {
		response.clearCookie('access_token', { domain: cookieDomain, path: '/' });
		response.clearCookie('refresh_token', { domain: cookieDomain, path: '/' });
		response.clearCookie('token_type', { domain: cookieDomain, path: '/' });
	}

	if (pnid) {
		// populate account
		response.locals.account = {
			pnid,
			settings: await getUserSettings(request.tokens),
			moderator: accountIsModerator(pnid)
		};
		// legacy stuff
		request.pid = pnid.pid;
		request.user = pnid;
	} else {
		// guest access
		response.locals.account = null;
		// legacy stuff
		request.pid = 1000000000;
		request.user = null;
	}

	// Guest access check
	if (!pnid && !requestOkForGuest(request)) {
		return response.redirect('/login');
	}

	// Already logged in?
	if (pnid && request.path === '/login') {
		return response.redirect('/titles/show?src=login');
	}

	response.locals.pid = request.pid;
	return next();
};

function isStartOfPath(path: string, value: string): boolean {
	return path.indexOf(value) === 0;
}

function requestOkForGuest(req: Request): boolean {
	const guestAccessPage =
		// isStartOfPath(req.path, '/users/') ||
		// (isStartOfPath(req.path, '/titles/') && req.path !== '/titles/show') ||
		(isStartOfPath(req.path, '/posts/') && !req.path.includes('/empathy'));

	const loginPage = req.path === '/login';

	// login page is always ok
	// guest access pages must not be writes and the instance must have guest enabled
	return loginPage || (guestAccessPage && !req.isWrite && req.guest_access);
}
