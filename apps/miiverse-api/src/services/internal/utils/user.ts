import { errors } from '@/services/internal/errors';
import type { InternalAPIError } from '@/services/internal/errors';
import type { AccountData } from '@/types/common/account-data';
import type { ISettings } from '@/types/mongoose/settings';

function checkUserAccess(auth: AccountData | null, targetUser: ISettings): InternalAPIError | null {
	const isUserBanned = targetUser.account_status < 0 || targetUser.account_status > 1;
	if (!auth?.moderator && isUserBanned) {
		return errors.for('user_banned');
	}

	// Profiles are only private to guests
	const isUserPrivate = targetUser.profile_visibility === 'users_only' && auth === null;
	if (isUserPrivate) {
		// Lie for privacy
		return errors.for('not_found');
	}

	return null;
}

export function assertCanAccessUser(auth: AccountData | null, targetUser: ISettings): void {
	const error = checkUserAccess(auth, targetUser);
	if (error !== null) {
		throw error;
	}
}

export function canAccessUser(auth: AccountData | null, targetUser: ISettings): boolean {
	const error = checkUserAccess(auth, targetUser);
	if (error !== null) {
		return false;
	}

	return true;
}
