import { z } from 'zod';
import { mapUserProfile, userProfileSchema } from '@/services/internal/contract/user';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/v2/get_user_data_rpc';
import type { UserWithSettings } from '@/services/internal/utils/user';

export const adminUserProfileSchema = userProfileSchema.extend({
	moderation: z.object({
		status: z.enum(['deleted', 'network_ban', 'juxt_ban', 'normal'])
	})
}).openapi('AdminUserProfile');

export type AdminUserProfileDto = z.infer<typeof adminUserProfileSchema>;

export function mapAdminUserProfile(user: UserWithSettings, pnid: GetUserDataResponse, followers: number, posts: number): AdminUserProfileDto {
	const profile = mapUserProfile(user, pnid, followers, posts);
	profile.profileInfo = {
		comment: user.settings?.profileComment ?? null,
		country: pnid.country ?? null,
		birthday: pnid.birthdate ? new Date(pnid.birthdate) : null,
		gameSkill: user.settings?.gameSkill ?? null
	};

	let status: AdminUserProfileDto['moderation']['status'] = 'normal';
	const deleted = pnid.deleted;
	const networkBanned = pnid.accessLevel < 0;
	const juxtBanned = user.accountStatus < 0 || user.accountStatus > 1;
	if (juxtBanned) {
		status = 'juxt_ban';
	}
	if (networkBanned) {
		status = 'network_ban';
	}
	if (deleted) {
		status = 'deleted';
	}

	return {
		...profile,
		moderation: {
			status
		}
	};
}
