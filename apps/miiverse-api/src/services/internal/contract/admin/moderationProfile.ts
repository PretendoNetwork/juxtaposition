import { z } from 'zod';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const moderationProfileSchema = z.object({
	pid: z.number(),
	accountStatus: z.number(),
	bannedUntil: z.date().nullable(),
	banReason: z.string().nullable()
}).openapi('ModerationProfile');

export type ModerationProfileDto = z.infer<typeof moderationProfileSchema>;

export function mapModerationProfile(settings: HydratedSettingsDocument): ModerationProfileDto {
	return {
		pid: settings.pid,
		accountStatus: settings.account_status,
		bannedUntil: settings.ban_lift_date ?? null,
		banReason: settings.ban_reason ?? null
	};
}
