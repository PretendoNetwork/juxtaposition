import { z } from 'zod';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const userBadgeSchema = z.enum([
	'al:dev',
	'al:tester',
	'al:mod',
	'verified',
	'support:mario',
	'support:super',
	'support:mega'
]).openapi('UserBadgeEnum');

export type UserBadgeEnum = z.infer<typeof userBadgeSchema>;

export const shallowUserSchema = z.object({
	pid: z.number(),
	miiName: z.string(),
	accountStatus: z.number()
}).openapi('ShallowUser');

export type ShallowUserDto = z.infer<typeof shallowUserSchema>;

export const userProfileSchema = z.object({
	pid: z.number(),
	miiName: z.string(),
	accountStatus: z.number(),
	username: z.string(),
	flags: z.array(userBadgeSchema),
	followers: z.number(),
	posts: z.number(),
	isOnline: z.boolean(),
	profileInfo: z.object({
		country: z.string().nullable(),
		birthday: z.date().nullable(),
		gameSkill: z.number().nullable(),
		comment: z.string().nullable()
	})
}).openapi('UserProfile');

export type UserProfileDto = z.infer<typeof userProfileSchema>;

export function mapShallowUser(settings: HydratedSettingsDocument): ShallowUserDto {
	return {
		pid: settings.pid,
		accountStatus: settings.account_status,
		miiName: settings.screen_name
	};
}

export function getProfileFlags(pnid: GetUserDataResponse): UserBadgeEnum[] {
	const flags: UserBadgeEnum[] = [];

	const tierMap: Record<string, UserBadgeEnum | undefined> = {
		'Mario': 'support:mario',
		'Super Mario': 'support:super',
		'Mega Mushroom': 'support:mega'
	};
	const tierFlag = tierMap[pnid.tierName];
	if (tierFlag) {
		flags.push(tierFlag);
	}

	const accessLevelMap: Record<number, UserBadgeEnum | undefined> = {
		3: 'al:dev',
		2: 'al:mod',
		1: 'al:tester'
	};
	const accessLevelFlag = accessLevelMap[pnid.accessLevel];
	if (accessLevelFlag) {
		flags.push(accessLevelFlag);
	}

	if (pnid.accessLevel > 2) {
		flags.push('verified');
	}

	return flags;
}

export function mapUserProfile(settings: HydratedSettingsDocument, pnid: GetUserDataResponse, followers: number, posts: number): UserProfileDto {
	return {
		pid: settings.pid,
		accountStatus: settings.account_status,
		username: pnid.username,
		miiName: settings.screen_name,
		flags: getProfileFlags(pnid),
		isOnline: settings.last_active ? isDateInRange(settings.last_active, 10) : false,
		profileInfo: {
			comment: settings.profile_comment_visibility ? settings.profile_comment ?? null : null,
			country: settings.country_visibility ? pnid.country : null,
			birthday: settings.birthday_visibility ? new Date(pnid.birthdate) : null,
			gameSkill: settings.game_skill_visibility ? settings.game_skill : null
		},
		followers,
		posts
	};
}

function isDateInRange(date: Date | null | undefined, minutes: number): boolean {
	if (!date) {
		return false;
	}
	const now = new Date();
	const tenMinutesAgo = new Date(now.getTime() - minutes * 60 * 1000);
	return date >= tenMinutesAgo && date <= now;
}
