import { getPIDFromServiceToken, getUserAccountData, getUserDataFromToken, getValueFromHeaders } from '@/util';
import { errors } from '@/services/internal/errors';
import { getUserSettings } from '@/database';
import type express from 'express';
import type { AccountData } from '@/types/common/account-data';

/**
 * Handles authentication for service (NNAS/console) and OAuth (web) tokens. Sets locals.account to AccountData.
 * Will error if tokens bad or account nonexistent, but otherwise does not check bans or setup status.
 */
async function auth(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	// Used by console applets
	const serviceToken = getValueFromHeaders(request.headers, 'x-service-token');
	// Used by web frontend
	const oAuthToken = getValueFromHeaders(request.headers, 'x-oauth-token');

	if (serviceToken && oAuthToken) {
		throw new errors.badRequest('Multiple authentication tokens provided');
	}

	if (serviceToken) {
		response.locals.account = await consoleAuth(serviceToken);
	} else if (oAuthToken) {
		response.locals.account = await webAuth(oAuthToken);
	} else {
		// Guest access
		response.locals.account = null;
	}

	return next();
}

async function consoleAuth(serviceToken: string): Promise<AccountData> {
	const pid = getPIDFromServiceToken(serviceToken);
	if (pid === 0) {
		throw new errors.unauthorized('Invalid service token');
	}

	const pnid = await getUserAccountData(pid);
	// If the user has a valid token for an unknown PID, just let the exception bubble

	const settings = await getUserSettings(pid) ?? undefined; // Null doesn't play nice with TS ?
	// Undef here just means the initial setup isn't done

	return { pnid, settings };
}

async function webAuth(oAuthToken: string): Promise<AccountData> {
	// The "normal" getUserData API (used here) is mutually incompatible with the "backdoor" one.
	// Since we can only use the backdoor one for consoles right now...
	const pid = (await getUserDataFromToken(oAuthToken).catch(() => {
		// TODO should probably check the error type here in case of e.g. connection refused
		throw new errors.unauthorized('Invalid OAuth token!');
	})).pid;
	// Ask the "backdoor" API, just use the above as a glorified token decryption.
	const pnid = await getUserAccountData(pid);

	const settings = await getUserSettings(pid) ?? undefined;

	return { pnid, settings };
}

export default auth;
