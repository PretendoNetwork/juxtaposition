import { z } from 'zod';
import { mapUserProfile, userProfileSchema } from '@/services/internal/contract/user';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const adminUserProfileSchema = userProfileSchema.extend({
	moderation: z.object({
		status: z.enum(['deleted', 'network_ban', 'juxt_ban', 'normal'])
	})
}).openapi('AdminUserProfile');

export type AdminUserProfileDto = z.infer<typeof adminUserProfileSchema>;

export function mapAdminUserProfile(settings: HydratedSettingsDocument, pnid: GetUserDataResponse, followers: number, posts: number): AdminUserProfileDto {
	const profile = mapUserProfile(settings, pnid, followers, posts);
	profile.profileInfo = {
		comment: settings.profile_comment ?? null,
		country: pnid.country ?? null,
		birthday: pnid.birthdate ? new Date(pnid.birthdate) : null,
		gameSkill: settings.game_skill ?? null
	};

	let status: AdminUserProfileDto['moderation']['status'] = 'normal';
	const deleted = pnid.deleted;
	const networkBanned = pnid.accessLevel < 0;
	const juxtBanned = settings.account_status < 0 || settings.account_status > 1;
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
