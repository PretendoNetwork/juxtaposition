import { z } from 'zod';
import type { UserWithSettings } from '@/services/internal/utils/user';

export const moderationProfileSchema = z.object({
	pid: z.number(),
	accountStatus: z.number(),
	bannedUntil: z.date().nullable(),
	banReason: z.string().nullable()
}).openapi('ModerationProfile');

export type ModerationProfileDto = z.infer<typeof moderationProfileSchema>;

export function mapModerationProfile(settings: UserWithSettings): ModerationProfileDto {
	return {
		pid: settings.pid,
		accountStatus: settings.account_status,
		bannedUntil: settings.ban_lift_date ?? null,
		banReason: settings.ban_reason ?? null
	};
}
