import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { adminStatsSchema, mapAdminStats } from '@/services/internal/contract/admin/adminStats';
import { getPostMetrics, getUserMetrics } from '@/metrics';

export const adminStatsRouter = createInternalApiRouter();

adminStatsRouter.get({
	path: '/admin/stats',
	name: 'admin.getStats',
	guard: guards.moderator,
	schema: {
		response: adminStatsSchema
	},
	async handler() {
		const userMetrics = await getUserMetrics();
		const postMetrics = await getPostMetrics();

		return mapAdminStats({
			dailyPosts: postMetrics.dailyPosts,
			totalPosts: postMetrics.totalPosts,
			onlineUsers: userMetrics.currentOnlineUsers,
			totalUsers: userMetrics.totalUsers
		});
	}
});
