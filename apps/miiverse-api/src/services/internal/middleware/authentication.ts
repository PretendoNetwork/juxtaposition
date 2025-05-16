import { getValueFromHeaders } from '@/util';
import { errors } from '@/services/internal/errors';
import type express from 'express';

async function auth(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const serviceToken = getValueFromHeaders(request.headers, 'x-service-token');
	const oAuthToken = getValueFromHeaders(request.headers, 'x-oauth-token');

	if (serviceToken && oAuthToken) {
		next(new errors.badRequest('Multiple authentication tokens provided'));
	}

	if (serviceToken) {
		// TODO
	} else if (oAuthToken) {
		// TODO
	} else {
		return next(new errors.unauthorized('Authentication token not provided'));
	}

	return next();
}

export default auth;
