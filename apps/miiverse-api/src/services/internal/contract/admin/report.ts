import { z } from 'zod';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { HydratedReportDocument } from '@/types/mongoose/report';
import type { HydratedPostDocument } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

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

export function mapReport(report: HydratedReportDocument, users: HydratedSettingsDocument[], post: HydratedPostDocument | null, community: HydratedCommunityDocument | null): ReportDto {
	const hasPost = post && !post.removed ? post : null;
	const isResolved = report.resolved || !hasPost;

	const reporter = users.find(v => v.pid === report.reported_by);
	const resolver = report.resolved_by ? users.find(v => v.pid === report.resolved_by) : null;

	return {
		id: report.id,
		createdAt: report.created_at,
		reporter: {
			pid: report.reported_by,
			user: reporter ? mapShallowUser(reporter) : null,
			reasonId: report.reason,
			message: report.message
		},
		resolved: {
			resolvedAt: report.resolved_at ?? null,
			pid: report.resolved_by ?? null,
			user: resolver ? mapShallowUser(resolver) : null,
			isResolved: isResolved,
			note: report.note ?? null,
			reason: report.resolved ? 'reportResolved' : 'similarReportResolved'
		},
		post: post ? mapPost(post, community) : null
	};
}
