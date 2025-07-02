import { errors } from '@/services/internal/errors';
import type express from 'express';

/**
 * Guest access is fine
 */
export async function guest(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	return next();
}

/**
 * Fail on guest access
 */
export async function user(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const account = response.locals.account;
	if (account === null) {
		// Guest access
		throw new errors.unauthorized('Authentication token not provided');
	}

	if (account.settings === null) {
		// Most endpoints expect users to have completed the account setup flow
		// TODO eventually this will need a carveout for the setup flow itself
		throw new errors.forbidden('Account setup not complete');
	}

	return next();
}

/**
 * Moderators only
 */
export async function moderator(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const account = response.locals.account;
	if (account === null) {
		// Guest access
		throw new errors.unauthorized('Authentication token not provided');
	}

	if (account.settings === null) {
		throw new errors.forbidden('Account setup not complete');
	}

	if (account.moderator !== true) {
		throw new errors.forbidden('You cannot access this endpoint');
	}

	return next();
}

export const guards = {
	guest,
	user,
	moderator
};
