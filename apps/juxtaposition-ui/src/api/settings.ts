/* !!! HEY
 * This type lives in apps/miiverse-api/src/services/internal/contract/settings.ts
 * Modify it there and copy-paste here! */

import { apiFetchUser } from '@/fetch';
import type { UserTokens } from '@/fetch';

export type UserSettingsDto = {
	pid: number;
	screen_name: string;
	account_status: number;
	ban_lift_date: Date | null;
	banned_by: number | null;
	ban_reason: string | null;
	profile_comment: string | null;
	profile_comment_visibility: boolean;
	game_skill: number;
	game_skill_visibility: boolean;
	birthday_visibility: boolean;
	relationship_visibility: boolean;
	country_visibility: boolean;
	profile_favorite_community_visibility: boolean;
	receive_notifications: boolean;
	created_at: Date | null;
	last_active: Date | null;
};

export async function getUserSettings(tokens: UserTokens): Promise<UserSettingsDto | null> {
	const settings = await apiFetchUser<UserSettingsDto>(tokens, `/api/v1/users/@me/profile/settings`);
	return settings;
}

export async function getUserSettingsForPid(tokens: UserTokens, pid: number): Promise<UserSettingsDto | null> {
	const settings = await apiFetchUser<UserSettingsDto>(tokens, `/api/v1/users/${pid}/profile/settings`);
	return settings;
}
