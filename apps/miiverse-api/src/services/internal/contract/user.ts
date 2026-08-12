import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/v2/get_user_data_rpc';
import type { User } from '@/prisma/client';
import type { UserWithSettings } from '@/services/internal/utils/user';

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

export const shallowUserSchema = asOpenapi('ShallowUser', z.object({
	pid: z.number(),
	miiName: z.string(),
	accountStatus: z.number()
}));

export type ShallowUserDto = z.infer<typeof shallowUserSchema>;

export const userProfileSchema = asOpenapi('UserProfile', z.object({
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
}));

export type UserProfileDto = z.infer<typeof userProfileSchema>;

export function mapShallowUser(user: User): ShallowUserDto {
	return {
		pid: user.pid,
		accountStatus: user.accountStatus,
		miiName: user.displayName
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

export function mapUserProfile(user: UserWithSettings, pnid: GetUserDataResponse, followers: number, posts: number): UserProfileDto {
	return {
		pid: user.pid,
		accountStatus: user.accountStatus,
		username: pnid.username,
		miiName: user.displayName,
		flags: getProfileFlags(pnid),
		isOnline: isDateInRange(user.lastSeen, 10),
		profileInfo: {
			comment: user.settings?.profileComment ?? null,
			country: user.settings?.isCountryVisible ? pnid.country : null,
			birthday: user.settings?.isBirthdayVisible ? new Date(pnid.birthdate) : null,
			gameSkill: user.settings?.isGameSkillVisible ? user.settings.gameSkill : null
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
