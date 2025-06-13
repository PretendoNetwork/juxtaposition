import { getPIDFromServiceToken, getUserAccountData, getUserDataFromToken, getValueFromHeaders } from '@/util';
import { errors } from '@/services/internal/errors';
import { getUserSettings } from '@/database';
import type express from 'express';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

/**
 * Handles authentication for service (NNAS/console) and OAuth (web) tokens. Sets locals.account to AccountData.
 * Will error if tokens bad or account nonexistent, but otherwise does not check bans or setup status.
 */
export async function authPopulate(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	// Used by console applets
	const serviceToken = getValueFromHeaders(request.headers, 'x-service-token');
	// Used by web frontend
	const oAuthToken = getValueFromHeaders(request.headers, 'x-oauth-token');

	if (serviceToken && oAuthToken) {
		throw new errors.badRequest('Multiple authentication tokens provided');
	}

	let pnid: GetUserDataResponse | null = null;
	if (serviceToken) {
		pnid = await consoleAuth(request, serviceToken);
	} else if (oAuthToken) {
		pnid = await webAuth(request, oAuthToken);
	}

	if (pnid !== null) {
		// Null here just means the initial setup isn't done
		const settings = await getUserSettings(pnid.pid);

		const moderator = accountIsModerator(pnid);

		response.locals.account = { pnid, settings, moderator };
	} else {
		// Guest access
		response.locals.account = null;
	}

	return next();
}

async function consoleAuth(_request: express.Request, serviceToken: string): Promise<GetUserDataResponse> {
	const pid = getPIDFromServiceToken(serviceToken);
	if (pid === 0) {
		throw new errors.unauthorized('Invalid service token');
	}

	// If the user has a valid token for an unknown PID, just let the exception bubble
	const pnid = await getUserAccountData(pid);

	return pnid;
}

async function webAuth(request: express.Request, oAuthToken: string): Promise<GetUserDataResponse> {
	// The "normal" getUserData API (used here) is mutually incompatible with the "backdoor" one.
	// Since we can only use the backdoor one for consoles right now...
	const pid = (await getUserDataFromToken(oAuthToken).catch((e) => {
		// TODO should probably check the error type here in case of e.g. connection refused
		request.log.error(e, 'Failed to get user data from OAuth token');
		throw new errors.unauthorized('Invalid OAuth token!');
	})).pid;
	// Ask the "backdoor" API, just use the above as a glorified token decryption.
	const pnid = await getUserAccountData(pid);

	return pnid;
}

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
