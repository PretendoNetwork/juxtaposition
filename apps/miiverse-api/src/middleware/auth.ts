import moment from 'moment';
import { z } from 'zod';
import { getUserAccountData, getValueFromHeaders, decodeParamPack, getPIDFromServiceToken } from '@/util';
import { getEndpoint, getUserSettings } from '@/database';
import { logger } from '@/logger';
import { badRequest, ApiErrorCode, serverError } from '@/errors';
import type express from 'express';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

const ParamPackSchema = z.object({
	title_id: z.string(),
	access_key: z.string(),
	platform_id: z.string(),
	region_id: z.string(),
	language_id: z.string(),
	country_id: z.string(),
	area_id: z.string(),
	network_restriction: z.string(),
	friend_restriction: z.string(),
	rating_restriction: z.string(),
	rating_organization: z.string(),
	transferable_id: z.string(),
	tz_name: z.string(),
	utc_offset: z.string(),
	remaster_version: z.string().optional()
});

async function auth(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	if (request.path.includes('/v1/status')) {
		return next();
	}

	// * Just don't care about the token here
	if (request.path === '/v1/topics') {
		return next();
	}

	let encryptedToken = getValueFromHeaders(request.headers, 'x-nintendo-servicetoken');
	if (!encryptedToken) {
		encryptedToken = getValueFromHeaders(request.headers, 'olive service token');
	}

	if (!encryptedToken) {
		return badRequest(response, ApiErrorCode.NO_TOKEN);
	}

	const pid: number = getPIDFromServiceToken(encryptedToken);
	if (pid === 0) {
		return badRequest(response, ApiErrorCode.BAD_TOKEN);
	}

	const paramPack = getValueFromHeaders(request.headers, 'x-nintendo-parampack');
	if (!paramPack) {
		return badRequest(response, ApiErrorCode.NO_PARAM_PACK);
	}

	const paramPackData = decodeParamPack(paramPack);
	const paramPackCheck = ParamPackSchema.safeParse(paramPackData);
	if (!paramPackCheck.success) {
		logger.error(paramPackCheck.error, 'Failed to parse param pack');
		return badRequest(response, ApiErrorCode.BAD_PARAM_PACK);
	}

	let user: GetUserDataResponse;

	try {
		user = await getUserAccountData(pid);
	} catch (error) {
		logger.error(error, `Failed to get account data for ${pid}`);
		return serverError(response, ApiErrorCode.ACCOUNT_SERVER_ERROR);
	}

	const discovery = await getEndpoint(user.serverAccessLevel);

	if (!discovery) {
		logger.error(user, `Discovery data is missing for ${user.serverAccessLevel}`);
		return serverError(response, ApiErrorCode.NO_DISCOVERY_DATA);
	}

	if (discovery.status > 0 && discovery.status <= 7) {
		return badRequest(response, discovery.status);
	} else if (discovery.status !== 0) {
		logger.error(discovery, `Discovery for ${user.serverAccessLevel} has unexpected status`);
		return serverError(response, ApiErrorCode.NO_DISCOVERY_DATA);
	}

	request.user = user;
	request.pid = pid;
	request.paramPack = paramPackData;

	const userSettings = await getUserSettings(request.pid);

	if (!userSettings && request.path === '/v1/endpoint') {
		return next();
	} else if (!userSettings) {
		return badRequest(response, ApiErrorCode.SETUP_NOT_COMPLETE);
	}

	if (moment(userSettings.ban_lift_date) <= moment() && userSettings.account_status !== 3) {
		userSettings.account_status = 0;
		await userSettings.save();
	}
	// This includes ban checks for both Juxt specifically and the account server, ideally this should be squashed
	// assuming we support more gradual bans on PNID's
	if (userSettings.account_status < 0 || userSettings.account_status > 1 || user.accessLevel < 0) {
		if (userSettings.account_status === 2 && request.method === 'GET') {
			return next();
		} else if (userSettings.account_status === 2) {
			return badRequest(response, ApiErrorCode.ACCOUNT_POSTING_LIMITED);
		} else {
			return badRequest(response, ApiErrorCode.ACCOUNT_BANNED);
		}
	}

	return next();
}

export default auth;
