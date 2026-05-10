import { Content } from '@/models/content';
import { Settings } from '@/models/settings';
import { errors } from '@/services/internal/errors';
import { getUserAccountData } from '@/util';
import { accountIsDeveloper, accountIsModerator } from '@/services/internal/middleware/auth-populate';
import type { AccountData, ActiveAccountData } from '@/types/common/account-data';

export async function tryGetUserData(auth: AccountData | null, targetPid: number): Promise<ActiveAccountData> {
	const settings = await Settings.findOne({ pid: targetPid });
	const content = await Content.findOne({ pid: targetPid });
	const pnid = await getUserAccountData(targetPid).catch(() => {
		return null;
	});
	if (!settings || !content || !pnid) {
		throw errors.for('not_found');
	}

	const moderator = accountIsModerator(pnid);
	const developer = accountIsDeveloper(pnid);

	const isUserBanned = (settings.account_status < 0 || settings.account_status > 1 || pnid.accessLevel < 0);
	const isUserDeleted = pnid.deleted;
	if (!auth?.moderator && isUserBanned) {
		throw errors.for('user_banned');
	}
	if (isUserDeleted) {
		throw errors.for('user_deleted');
	}

	// Profiles are only private to guests
	const isUserPrivate = settings.profile_visibility === false && auth === null;
	if (isUserPrivate) {
		// Lie for privacy
		throw errors.for('not_found');
	}

	return { pnid, settings, moderator, developer, content };
}
