import { config } from '@/config';
import { logger } from '@/logger';
import { getUserAccountData, getUserDataFromToken, processLanguage } from '@/util';
import type { RequestHandler, Request, Response } from 'express';

const cookieDomain = config.http.cookieDomain;

export const webAuth: RequestHandler = async (request, response, next) => {
	// Get pid and fetch user data

	if (request.session && request.session.user && request.session.pid && !request.isWrite && request.cookies.access_token) {
		request.user = request.session.user;
		request.pid = request.session.pid;
	} else if (request.cookies.access_token) {
		try {
			request.pid = (await getUserDataFromToken(request.cookies.access_token)).pid;
			request.user = await getUserAccountData(request.pid);

			request.session.user = request.user;
			request.session.pid = request.pid;
		} catch (e) {
			logger.error(e, 'Failed to authenticate user from access token');
			response.clearCookie('access_token', { domain: cookieDomain, path: '/' });
			response.clearCookie('refresh_token', { domain: cookieDomain, path: '/' });
			response.clearCookie('token_type', { domain: cookieDomain, path: '/' });
			if (request.path === '/login') {
				response.locals.lang = processLanguage();
				request.tokens = {};
				request.paramPackData = null;
				return next();
			}
		}
	}

	request.tokens = { oauthToken: request.cookies.access_token };

	// Handle guest access pages
	if (!request.pid) {
		if (!requestOkForGuest(request)) {
			return loginWall(request, response);
		}

		request.pid = 1000000000;
		response.locals.pid = request.pid;
		return next();
	}

	if (request.pid && request.path === '/login') {
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
		isStartOfPath(req.path, '/users/') ||
		(isStartOfPath(req.path, '/titles/') && req.path !== '/titles/show') ||
		(isStartOfPath(req.path, '/posts/') && !req.path.includes('/empathy'));

	const loginPage = req.path === '/login';

	// login page is always ok
	// guest access pages must not be writes and the instance must have guest enabled
	return loginPage || (guestAccessPage && !req.isWrite && req.guest_access);
}

export function loginWall(req: Request, res: Response): void {
	let path = req.originalUrl;

	// bit rude to log someone in and 404 them right after
	if (path === '/404') {
		req.log.error('Likely bad guest route handler, will bail to homepage');
		path = '/';
	}

	req.session.user = null;
	return res.redirect(`/login?redirect=${path}`);
}
