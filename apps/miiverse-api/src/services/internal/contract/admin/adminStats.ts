import { z } from 'zod';

export const adminStatsSchema = z.object({
	dailyPosts: z.number(),
	totalPosts: z.number(),
	onlineUsers: z.number(),
	totalUsers: z.number()
}).openapi('AdminStats');

export type AdminStatsDto = z.infer<typeof adminStatsSchema>;

export function mapAdminStats(stats: AdminStatsDto): AdminStatsDto {
	return stats;
}
