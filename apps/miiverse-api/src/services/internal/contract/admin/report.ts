import { z } from 'zod';
import { mapPostWithModeration, postSchema } from '@/services/internal/contract/post';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { HydratedPostDocument } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { Report, User } from '@/prisma/client';

export const reportSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	post: postSchema.nullable(),
	reporter: z.object({
		pid: z.number(),
		user: shallowUserSchema.nullable(),
		reasonId: z.number(),
		message: z.string()
	}),
	resolved: z.object({
		isResolved: z.boolean(),
		resolvedAt: z.date().nullable(),
		pid: z.number().nullable(),
		user: shallowUserSchema.nullable(),
		note: z.string().nullable(),
		reason: z.enum(['reportResolved', 'similarReportResolved']).nullable()
	})
}).openapi('Report');

export type ReportDto = z.infer<typeof reportSchema>;

export function mapReport(report: Report, users: User[], post: HydratedPostDocument | null, community: HydratedCommunityDocument | null): ReportDto {
	const hasPost = post && !post.removed ? post : null;
	const isResolved = report.resolved || !hasPost;

	const reporter = users.find(v => v.pid === report.reportedBy);
	const resolver = report.reportedBy ? users.find(v => v.pid === report.reportedBy) : null;

	const remover = post?.removed_by ? users.find(v => v.pid === post.removed_by) ?? null : null;

	return {
		id: report.id,
		createdAt: report.createdAt,
		reporter: {
			pid: report.reportedBy,
			user: reporter ? mapShallowUser(reporter) : null,
			reasonId: report.reportReasonId,
			message: report.reportMessage
		},
		resolved: {
			resolvedAt: report.resolvedAt ?? null,
			pid: report.resolvedBy ?? null,
			user: resolver ? mapShallowUser(resolver) : null,
			isResolved: isResolved,
			note: report.moderationNote ?? null,
			reason: report.resolved ? 'reportResolved' : 'similarReportResolved'
		},
		post: post ? mapPostWithModeration(post, community, remover) : null
	};
}
