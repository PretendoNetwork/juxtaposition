import { errors } from '@/services/internal/errors';
import type express from 'express';

/**
 * Checks the user account is valid for this request (not banned, setup complete, etc.)
 */
export async function authAccessCheck(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const account = response.locals.account;
	if (account === null) {
		// Guest access
		return next();
	}

	if (account.pnid.deleted) {
		throw new errors.unauthorized('Account does not exist');
	}

	if (account.pnid.accessLevel < 0 ||
		account.pnid.permissions?.bannedAllPermanently === true ||
		account.pnid.permissions?.bannedAllTemporarily === true) {
		throw new errors.forbidden('Account has been banned');
	}

	// TODO console linking check (needs account server support)

	if (account.settings === null) {
		// Account hasn't completed initial setup yet
		// User guard will check this for endpoints that care
		// Still.. spooky
		return next();
	}

	// 0 = normal, 1 = limited from posting, 2 = temp ban, 3 = perma ban
	if (account.settings.account_status !== 0 && account.settings.account_status !== 1) {
		throw new errors.forbidden('Account has been banned from Juxtaposition');
	}

	// TODO lift expired temporary bans and post limits (frontend's responsibility for now)

	return next();
}
