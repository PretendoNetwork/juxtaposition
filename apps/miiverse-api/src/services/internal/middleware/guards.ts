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
		throw errors.for('requires_auth');
	}

	const authError = response.locals.accountAuthError;
	if (authError) {
		// Auth access checks determined that this account can't access juxt
		throw authError;
	}

	if (account.settings === null) {
		// Most endpoints expect users to have completed the account setup flow
		throw errors.for('auth_onboarding_incomplete');
	}

	return next();
}

/**
 * Moderators only
 */
export async function moderator(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	return guards.user(request, response, () => {
		const account = response.locals.account;
		if (account === null) {
			// Guest access
			throw errors.for('requires_auth');
		}

		if (account.settings === null) {
			throw errors.for('auth_onboarding_incomplete');
		}

		if (account.moderator !== true) {
			throw errors.for('forbidden');
		}

		return next();
	});
}

/**
 * Developers only
 */
export async function developer(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	return guards.user(request, response, () => {
		const account = response.locals.account;
		if (account === null) {
			throw errors.for('requires_auth');
		}

		if (account.developer !== true) {
			throw errors.for('forbidden');
		}

		return next();
	});
}

export const guards = {
	guest,
	user,
	moderator,
	developer
};
