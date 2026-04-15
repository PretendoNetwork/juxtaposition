import { z } from 'zod';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import type { HydratedReportDocument } from '@/types/mongoose/report';
import type { HydratedPostDocument } from '@/types/mongoose/post';

export const reportSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	post: postSchema.nullable(),
	reporter: z.object({
		pid: z.number(),
		reasonId: z.number(),
		message: z.string()
	}),
	resolved: z.object({
		isResolved: z.boolean(),
		resolvedAt: z.date().nullable(),
		pid: z.number().nullable(),
		reason: z.enum(['reportResolved', 'similarReportResolved']).nullable()
	})
}).openapi('Report');

export type ReportDto = z.infer<typeof reportSchema>;

export function mapReport(report: HydratedReportDocument, inputPost: HydratedPostDocument | null): ReportDto {
	const post = inputPost && !inputPost.removed ? inputPost : null;
	const isResolved = report.resolved || !post;
	return {
		id: report.id,
		createdAt: report.created_at,
		reporter: {
			pid: report.reported_by,
			reasonId: report.reason,
			message: report.message
		},
		resolved: {
			resolvedAt: report.resolved_at ?? null,
			pid: report.resolved_by ?? null,
			isResolved: isResolved,
			reason: report.resolved ? 'reportResolved' : 'similarReportResolved'
		},
		post: post ? mapPost(post) : null
	};
}
