import { z } from 'zod';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import type { HydratedReportDocument } from '@/types/mongoose/report';
import type { HydratedPostDocument } from '@/types/mongoose/post';

export const reportSchema = z.object({
	id: z.string(),
	createdBy: z.number(),
	createdAt: z.date(),
	reasonId: z.number(),
	message: z.string(),
	post: postSchema
}).openapi('Report');

export type ReportDto = z.infer<typeof reportSchema>;

export function mapReport(report: HydratedReportDocument, post: HydratedPostDocument): ReportDto {
	return {
		id: report.id,
		createdAt: report.created_at,
		createdBy: report.reported_by,
		reasonId: report.reason,
		message: report.message,
		post: mapPost(post)
	};
}
