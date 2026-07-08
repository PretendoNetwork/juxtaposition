import { z } from 'zod';
import type { User } from '@/prisma/client';

export const moderationProfileSchema = z.object({
	pid: z.number(),
	accountStatus: z.number(),
	bannedUntil: z.date().nullable(),
	banReason: z.string().nullable()
}).openapi('ModerationProfile');

export type ModerationProfileDto = z.infer<typeof moderationProfileSchema>;

export function mapModerationProfile(user: User): ModerationProfileDto {
	return {
		pid: user.pid,
		accountStatus: user.accountStatus,
		bannedUntil: user.banEndsAt ?? null,
		banReason: user.banReason ?? null
	};
}
