import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapReport, reportSchema } from '@/services/internal/contract/admin/report';
import { Report } from '@/models/report';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { createLogEntry } from '@/services/internal/utils/auditLogs';
import { createNewPostDeletionNotification } from '@/services/internal/utils/notifications';
import type { ReportDto } from '@/services/internal/contract/admin/report';

export const adminReportsRouter = createInternalApiRouter();

adminReportsRouter.get({
	path: '/admin/reports/open',
	name: 'admin.reports.listOpen',
	guard: guards.moderator,
	schema: {
		response: z.array(reportSchema)
	},
	async handler() {
		const rawReports = await Report
			.find({ resolved: false })
			.sort({ created_at: -1 });
		const postIds = rawReports.map(obj => obj.post_id);
		const nonRemovedPosts = await Post.find(
			{ id: { $in: postIds }, removed: false }
		);

		const postMap = new Map(nonRemovedPosts.map(p => [p.id, p]));
		const reportsWithPost = rawReports.map(v => ({
			report: v,
			post: postMap.get(v.post_id)
		}));

		const reports: ReportDto[] = [];
		reportsWithPost.forEach((v) => {
			if (v.post) {
				reports.push(mapReport(v.report, v.post));
			}
		});
		return reports;
	}
});

adminReportsRouter.post({
	path: '/admin/reports/:id/actions/delete',
	name: 'admin.reports.actions.removePost',
	guard: guards.moderator,
	schema: {
		params: z.object({
			id: z.string()
		}),
		body: z.object({
			reason: z.string().optional()
		}),
		response: resultSchema
	},
	async handler({ params, body, auth }) {
		const account = auth!;

		const report = await Report.findOne({ id: params.id });
		if (!report) {
			throw new errors.notFound('Not found');
		}

		const post = await Post.findOne({ id: report.post_id });
		if (post === null) {
			return mapResult('success'); // Already deleted, action already done
		}

		// Copied from post deletion endpoint, should probably be a util
		const reason = body.reason ?? 'Removed by moderator';
		await post.del(reason, account.pnid.pid);
		if (post.parent) {
			await Post.findOneAndUpdate({
				id: post.parent
			}, {
				$inc: { reply_count: -1 }
			});
		}

		await Report.findOneAndUpdate({
			$set: {
				resolved: true,
				resolved_by: account.pnid.pid,
				resolved_at: new Date(),
				note: reason
			}
		});
		await createNewPostDeletionNotification({
			postAuthor: post.id,
			post: post,
			reason
		});
		await createLogEntry({
			actorId: account.pnid.pid,
			action: 'REMOVE_POST',
			targetResourceId: post.id,
			context: `Post ${post.id} removed for: "${reason}"`
		});

		return mapResult('success');
	}
});

adminReportsRouter.post({
	path: '/admin/reports/:id/actions/ignore',
	name: 'admin.reports.actions.ignoreReport',
	guard: guards.moderator,
	schema: {
		params: z.object({
			id: z.string()
		}),
		body: z.object({
			reason: z.string().optional()
		}),
		response: resultSchema
	},
	async handler({ params, body, auth }) {
		const account = auth!;

		const report = await Report.findOne({ id: params.id });
		if (!report) {
			throw new errors.notFound('Not found');
		}

		await Report.findOneAndUpdate({
			$set: {
				resolved: true,
				resolved_by: account.pnid.pid,
				resolved_at: new Date(),
				note: body.reason ?? null
			}
		});
		await createLogEntry({
			actorId: account.pnid.pid,
			action: 'IGNORE_REPORT',
			targetResourceId: report.id,
			context: `Report ${report.id} ignored for: "${body.reason ?? 'No reason provided'}"`
		});

		return mapResult('success');
	}
});
