import { errors } from '@/services/internal/errors';
import type express from 'express';

/**
 * Guest access is fine
 */
export async function authGuest(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	return next();
}

/**
 * Fail on guest access
 */
export async function authUsers(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const account = response.locals.account;
	if (account === null) {
		// Guest access
		throw new errors.unauthorized('Authentication token not provided');
	}

	return next();
}

/**
 * Moderators only
 */
export async function authModerators(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const account = response.locals.account;
	if (account === null) {
		// Guest access
		throw new errors.unauthorized('Authentication token not provided');
	}

	if (account.pnid.accessLevel < 2) {
		throw new errors.forbidden('You cannot access this endpoint');
	}

	return next();
}
