import { mapUserProfile } from '@/services/internal/contract/user';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { UserProfileDto } from '@/services/internal/contract/user';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export function mapAdminUserProfile(settings: HydratedSettingsDocument, pnid: GetUserDataResponse, followers: number, posts: number): UserProfileDto {
	const profile = mapUserProfile(settings, pnid, followers, posts);
	profile.profileInfo = {
		comment: settings.profile_comment ?? null,
		country: pnid.country ?? null,
		birthday: pnid.birthdate ? new Date(pnid.birthdate) : null,
		gameSkill: settings.game_skill ?? null
	};
	return profile;
}
