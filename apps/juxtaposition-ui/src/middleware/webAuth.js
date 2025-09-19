import { config } from '@/config';
import { logger } from '@/logger';
import { getUserAccountData, getUserDataFromToken, processLanguage } from '@/util';

const cookieDomain = config.http.cookieDomain;

export async function webAuth(request, response, next) {
	// Get pid and fetch user data

	if (request.session && request.session.user && request.session.pid && !request.isWrite && request.cookies.access_token) {
		request.user = request.session.user;
		request.pid = request.session.pid;
	} else {
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

	// Open access pages
	if (isStartOfPath(request.path, '/users/') ||
		(isStartOfPath(request.path, '/titles/') && request.path !== '/titles/show') ||
		(isStartOfPath(request.path, '/posts/') && !request.path.includes('/empathy'))) {
		if (!request.pid && request.guest_access && !request.isWrite) {
			request.pid = 1000000000;
			response.locals.pid = request.pid;
			return next();
		} else if (!request.pid) {
			return response.redirect('/login');
		}
	}
	// Login endpoint
	if (request.path === '/login') {
		if (request.pid) {
			return response.redirect('/titles/show?src=login');
		}
		return next();
	}
	if (!request.pid) {
		return response.redirect('/login');
	}

	response.locals.pid = request.pid;
	return next();
}

function isStartOfPath(path, value) {
	return path.indexOf(value) === 0;
}

BigInt.prototype['toJSON'] = function () {
	return this.toString();
};
