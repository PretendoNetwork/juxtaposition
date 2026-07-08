import { z } from 'zod';
import type { ProfilePrivacyType, UserSetting } from '@/prisma/client';

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

export const profilePrivacyMap: Record<ProfilePrivacyType, ProfileVisibilityEnum> = {
	Public: 'public',
	UsersOnly: 'users_only'
};
export const profilePrivacyReverseMap: Record<ProfileVisibilityEnum, ProfilePrivacyType> = {
	public: 'Public',
	users_only: 'UsersOnly'
};

export function mapUserSettings(settings: UserSetting): UserSettingsDto {
	return {
		pid: settings.pid,
		profileVisibility: profilePrivacyMap[settings.profilePrivacy],
		birthdayVisible: settings.isBirthdayVisible,
		countryVisible: settings.isCountryVisible,
		gameSkillVisible: settings.isGameSkillVisible,
		comment: settings.profileComment
	};
}
