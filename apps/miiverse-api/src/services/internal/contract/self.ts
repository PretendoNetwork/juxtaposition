import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { AccountData } from '@/types/common/account-data';

export const banCodes = z.enum(['network_ban', 'temp_ban', 'perma_ban']).openapi('BanCodeEnum');

export type BanCodesEnum = z.infer<typeof banCodes>;

export const selfPermissionsSchema = z.object({
	posting: z.boolean(),
	moderator: z.boolean(),
	tester: z.boolean(),
	developer: z.boolean(),
	accessLevel: z.number()
}).openapi('SelfPermissions');

export const selfBanStateSchema = asOpenapi('SelfBanState', z.object({
	code: banCodes,
	endDate: z.date().nullable(),
	reason: z.string().nullable()
}));

export const selfContentSchema = z.object({
	followed_communities: z.array(z.string()),
	followed_users: z.array(z.number())
}).openapi('SelfContent');

export const selfSchema = z.object({
	pid: z.number(),
	username: z.string(),
	hasDoneOnboarding: z.boolean(),
	miiName: z.string(),
	accountStatus: z.number(),
	content: selfContentSchema,
	permissions: selfPermissionsSchema,
	banState: selfBanStateSchema.nullable()
}).openapi('Self');

export type SelfDto = z.infer<typeof selfSchema>;

export const selfNotificationCountSchema = z.object({
	unreadNotifications: z.number()
}).openapi('SelfNotificationCount');

export type SelfNotificationCountDto = z.infer<typeof selfNotificationCountSchema>;

const baseSelf: SelfDto = {
	pid: 0,
	username: '',
	accountStatus: 0,
	hasDoneOnboarding: false,
	miiName: '',
	content: {
		followed_communities: [],
		followed_users: []
	},
	permissions: {
		moderator: false,
		developer: false,
		tester: false,
		posting: false,
		accessLevel: 0
	},
	banState: null
};

export function mapBannedSelf(auth: AccountData, banCode: BanCodesEnum, banLiftDate: Date | null, banReason: string | null): SelfDto {
	return {
		...baseSelf,
		pid: auth.pnid.pid,
		username: auth.pnid.username,
		banState: {
			endDate: banLiftDate,
			reason: banReason,
			code: banCode
		}
	};
}

export function mapSelf(auth: AccountData): SelfDto {
	if (!auth.settings || !auth.content) {
		return {
			...baseSelf,
			pid: auth.pnid.pid
		};
	}

	return {
		pid: auth.pnid.pid,
		username: auth.pnid.username,
		accountStatus: auth.settings.account_status,
		miiName: auth.settings.screen_name,
		hasDoneOnboarding: true,
		content: {
			followed_communities: auth.content.followed_communities.filter(v => v !== '0'),
			followed_users: auth.content.followed_users.filter(v => v !== 0)
		},
		permissions: {
			moderator: auth.moderator,
			tester: auth.pnid.accessLevel >= 1 && auth.pnid.accessLevel <= 3,
			developer: auth.developer,
			accessLevel: auth.pnid.accessLevel,

			// 0 = normal, 1 = limited from posting, 2 = temp ban, 3 = perma ban
			posting: auth.settings.account_status === 0
		},
		banState: null
	};
}

export function mapSelfNotificationCount(unreadNotifications: number): SelfNotificationCountDto {
	return {
		unreadNotifications
	};
}
