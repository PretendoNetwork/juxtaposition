import type { ISettings } from '@/types/mongoose/settings';

/* !!! HEY
 * This type has a copy in apps/juxtaposition-ui/src/api/settings.ts
 * Make sure to copy over any modifications! */

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

export function mapUserSetttings(settings: ISettings): UserSettingsDto {
	return {
		pid: settings.pid,
		screen_name: settings.screen_name,
		account_status: settings.account_status,
		ban_lift_date: settings.ban_lift_date ?? null,
		banned_by: settings.banned_by ?? null,
		ban_reason: settings.ban_reason ?? null,
		profile_comment: settings.profile_comment ?? null,
		profile_comment_visibility: settings.profile_comment_visibility,
		game_skill: settings.game_skill,
		game_skill_visibility: settings.game_skill_visibility,
		birthday_visibility: settings.birthday_visibility,
		relationship_visibility: settings.relationship_visibility,
		country_visibility: settings.country_visibility,
		profile_favorite_community_visibility: settings.profile_favorite_community_visibility,
		receive_notifications: settings.receive_notifications,
		created_at: settings.created_at ?? null,
		last_active: settings.last_active ?? null
	};
}
