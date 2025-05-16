import { errors } from '@/services/internal/errors';
import type express from 'express';
import type { AccountData } from '@/types/common/account-data';

/**
 * Checks the user account is valid for this request (not banned, setup complete, etc.)
 */
async function checkUserAccount(request: express.Request, response: express.Response, next: express.NextFunction): Promise<void> {
	const account = response.locals!.account as AccountData;

	if (account.pnid.accessLevel < 0) {
		throw new errors.unauthorized('Account has been banned');
	}

	// TODO account settings, temp bans, etc.

	return next();
}

export default checkUserAccount;
