import { config } from '@/config';
import { logger } from '@/logger';
import { CtrFatalErrorView } from '@/services/juxt-web/views/ctr/errorView';
import { PortalFatalErrorView } from '@/services/juxt-web/views/portal/errorView';
import { decodeParamPack, getPIDFromServiceToken, getUserAccountData, getUserDataFromToken, processLanguage } from '@/util';
import type { RequestHandler, Response } from 'express';

function renderAuthError(res: Response, code: number, message: string): void {
	res.jsxForDirectory({
		portal: <PortalFatalErrorView code={code} message={message} />,
		ctr: <CtrFatalErrorView code={code} message={message} />
	});
}

export const consoleAuth: RequestHandler = async (request, response, next) => {
	// Get pid and fetch user data
	if (request.session && request.session.user && request.session.pid && request.session.tokens && !request.isWrite) {
		request.user = request.session.user;
		request.pid = request.session.pid;
		request.tokens = request.session.tokens;
	} else {
		request.tokens = { serviceToken: request.get('x-nintendo-servicetoken') };
		request.pid = request.headers['x-nintendo-servicetoken'] ? getPIDFromServiceToken(request.get('x-nintendo-servicetoken') ?? '') : null;
		request.user = request.pid ? await getUserAccountData(request.pid) : null;

		request.session.user = request.user;
		request.session.pid = request.pid;
		request.session.tokens = request.tokens;
	}

	// Set headers
	const ppack = request.get('x-nintendo-parampack');
	request.paramPackData = ppack ? decodeParamPack(ppack) : null;
	response.header('X-Nintendo-WhiteList', config.whitelist);

	if (!request.user && request.cookies.access_token) {
		try {
			// Developer accounts may bypass console checks
			const user = await getUserDataFromToken(request.cookies.access_token);
			if (user.accessLevel === 3 || config.disableConsoleChecks) {
				request.user = await getUserAccountData(user.pid);
				request.pid = user.pid;

				request.session.user = request.user;
				request.session.pid = request.pid;

				request.tokens = { oauthToken: request.cookies.access_token };
				request.session.tokens = request.tokens;
			} else {
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

	const mayBypassAuthChecks = request.user?.accessLevel === 3 || config.disableConsoleChecks;

	// This section includes checks if a user is a developer and adds exceptions for these cases
	if (!request.pid) {
		return renderAuthError(response, 5989999, 'Unable to parse service token. Are you using a Nintendo Network ID?');
	}
	if (!request.user) {
		return renderAuthError(response, 5989999, 'Unable to fetch user data. Please try again later.');
	}

	if (!mayBypassAuthChecks && !request.paramPackData) {
		return renderAuthError(response, 5989999, 'Missing auth headers');
	}
	const userAgent = request.get('user-agent') ?? '';
	const uaIsConsole = userAgent.includes('Nintendo WiiU') || userAgent.includes('Nintendo 3DS');
	if (!mayBypassAuthChecks && !uaIsConsole) {
		return renderAuthError(response, 5989999, 'Invalid authentication method used.');
	}

	response.locals.uaIsConsole = uaIsConsole;
	response.locals.lang = processLanguage(request.paramPackData);
	response.locals.pid = request.pid;
	return next();
};
