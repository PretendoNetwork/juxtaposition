import { errors } from '@/services/internal/errors';
import type { User, UserSetting } from '@/prisma/client';
import type { InternalAPIError } from '@/services/internal/errors';
import type { AccountData } from '@/types/common/account-data';

export type UserWithSettings = User & {
	settings: UserSetting | null;
};

function checkUserAccess(auth: AccountData | null, targetUser: UserWithSettings): InternalAPIError | null {
	const isUserBanned = targetUser.accountStatus < 0 || targetUser.accountStatus > 1;
	if (!auth?.moderator && isUserBanned) {
		return errors.for('user_banned');
	}

	// Profiles are only private to guests
	const isUserPrivate = targetUser.settings?.profilePrivacy === 'UsersOnly' && auth === null;
	if (isUserPrivate) {
		// Lie for privacy
		return errors.for('not_found');
	}

	return null;
}

export function assertCanAccessUser(auth: AccountData | null, targetUser: UserWithSettings): void {
	const error = checkUserAccess(auth, targetUser);
	if (error !== null) {
		throw error;
	}
}

export function canAccessUser(auth: AccountData | null, targetUser: UserWithSettings): boolean {
	const error = checkUserAccess(auth, targetUser);
	if (error !== null) {
		return false;
	}

	return true;
}
