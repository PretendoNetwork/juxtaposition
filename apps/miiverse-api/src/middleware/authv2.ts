import { ApiErrorCode, badRequestV2 } from '@/errors';
import { getValueFromHeaders } from '@/util';
import type express from 'express';

async function auth(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const serviceToken = getValueFromHeaders(request.headers, 'x-service-token');
	const oAuthToken = getValueFromHeaders(request.headers, 'x-oauth-token');

	if (serviceToken && oAuthToken) {
		return badRequestV2(response, ApiErrorCode.BAD_TOKEN);
	}

	if (serviceToken) {
		// TODO
	} else if (oAuthToken) {
		// TODO
	} else {
		return badRequestV2(response, ApiErrorCode.BAD_TOKEN);
	}

	return next();
}

export default auth;
