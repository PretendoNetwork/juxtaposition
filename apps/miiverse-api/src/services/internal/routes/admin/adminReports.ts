import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { mapReport, reportSchema } from '@/services/internal/contract/admin/report';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { createLogEntry } from '@/services/internal/utils/auditLogs';
import { createNewPostDeletionNotification } from '@/services/internal/utils/notifications';
import { standardSortSchema, standardSortToDirectionPrisma } from '@/services/internal/contract/utils';
import { feedPageDtoSchema, mapFeedPage, pageControlSchema } from '@/services/internal/contract/page';
import { Community } from '@/models/community';

export const adminReportsRouter = createInternalApiRouter();

adminReportsRouter.get({
	path: '/admin/reports',
	name: 'admin.reports.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			resolved: z.stringbool().optional(),
			offenderPid: z.coerce.number().optional(),
			reporterPid: z.coerce.number().optional(),
			sort: standardSortSchema
		}).extend(pageControlSchema(150)),
		response: feedPageDtoSchema(reportSchema)
	},
	async handler({ query, db }) {
		if (query.resolved !== undefined && query.offset > 0) {
			throw errors.for('bad_request', 'Pagination is not possible when filtering for resolved states');
		}

		const rawReports = await db.report.findMany({
			where: {
				resolved: query.resolved,
				postAuthor: query.offenderPid,
				reportedBy: query.reporterPid
			},
			orderBy: {
				createdAt: standardSortToDirectionPrisma(query.sort)
			},
			take: query.limit,
			skip: query.offset
		});
		const postIds = rawReports.map(obj => obj.postId);
		const posts = await Post.find(
			{ id: { $in: postIds } }
		);

		const communityIds = posts.map(v => v.community_id);
		const communities = await Community.find({ olive_community_id: { $in: communityIds } });

		const relatedUserIds = [
			...rawReports.flatMap(v => [v.reportedBy, v.resolvedBy]),
			...posts.map(v => v.removed_by)
		].filter((v): v is number => !!v);
		const users = await db.user.findMany({
			where: {
				pid: {
					in: relatedUserIds
				}
			}
		});

		let reports = rawReports.map((report) => {
			const post = posts.find(v => v.id === report.postId) ?? null;
			const community = post ? communities.find(v => v.olive_community_id === post.community_id) ?? null : null;
			return mapReport(report, users, post, community);
		});

		// Reports can be resolved by the original post being removed, this is not set in the DB
		// This is why pagination is not possible when filtering for resolved states
		if (query.resolved !== undefined) {
			const resolvedFilter = query.resolved;
			reports = reports.filter(v => v.resolved.isResolved === resolvedFilter);
		}

		return mapFeedPage(reports);
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
	async handler({ db, params, body, auth }) {
		const account = auth!;

		const report = await db.report.findFirst({
			where: {
				id: params.id
			}
		});
		if (!report) {
			throw errors.for('not_found');
		}

		const post = await Post.findOne({ id: report.postId });
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

		await db.report.update({
			where: {
				id: report.id
			},
			data: {
				resolved: true,
				resolvedBy: account.pnid.pid,
				resolvedAt: new Date(),
				moderationNote: reason
			}
		});
		await createNewPostDeletionNotification(db, {
			postAuthor: post.pid,
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
	async handler({ params, body, auth, db }) {
		const account = auth!;

		const report = await db.report.findFirst({
			where: {
				id: params.id
			}
		});
		if (!report) {
			throw errors.for('not_found');
		}

		await db.report.update({
			where: {
				id: report.id
			},
			data: {
				resolved: true,
				resolvedBy: account.pnid.pid,
				resolvedAt: new Date(),
				moderationNote: body.reason ?? null
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
