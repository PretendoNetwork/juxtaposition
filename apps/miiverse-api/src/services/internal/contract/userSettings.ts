import { z } from 'zod';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const profileVisibilitySchema = z.enum(['public', 'users_only']).openapi('ProfileVisibilityEnum');
export type ProfileVisibilityEnum = z.infer<typeof profileVisibilitySchema>;

export const userSettingsSchema = z.object({
	pid: z.number(),
	profileVisibility: profileVisibilitySchema,
	countryVisible: z.boolean(),
	birthdayVisible: z.boolean(),
	gameSkillVisible: z.boolean(),
	comment: z.string().nullable()
}).openapi('UserSettings');
export type UserSettingsDto = z.infer<typeof userSettingsSchema>;

export function mapUserSettings(settings: HydratedSettingsDocument): UserSettingsDto {
	return {
		pid: settings.pid,
		profileVisibility: (settings.profile_visibility as ProfileVisibilityEnum | null) ?? 'public',
		birthdayVisible: settings.birthday_visibility,
		countryVisible: settings.country_visibility,
		gameSkillVisible: settings.game_skill_visibility,
		comment: settings.profile_comment_visibility ? settings.profile_comment ?? '' : null
	};
}
