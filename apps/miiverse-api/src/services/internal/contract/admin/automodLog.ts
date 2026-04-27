import { z } from 'zod';
import { mapShallowAutomodRule, shallowAutomodRuleSchema } from '@/services/internal/contract/admin/automodRule';
import { automodAction } from '@/models/automodLog';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { HydratedAutomodLogDocument } from '@/models/automodLog';
import type { HydratedAutomodRuleDocument } from '@/models/automodRules';

export const automodActionEnum = asOpenapi('AutomodActionEnum', z.enum(automodAction));

export const automodLogSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	rule: shallowAutomodRuleSchema.nullable(),
	action: automodActionEnum,
	postAuthor: z.number(),
	postId: z.string().nullable(),
	postContent: z.object({
		body: z.string().nullable()
	})
}).openapi('AutomodLog');

export type AutomodLogDto = z.infer<typeof automodLogSchema>;

export function mapAutomodLog(log: HydratedAutomodLogDocument, rule: HydratedAutomodRuleDocument | null): AutomodLogDto {
	return {
		id: log.id,
		createdAt: log.created_at,
		rule: rule ? mapShallowAutomodRule(rule) : null,
		action: log.action,
		postAuthor: log.author,
		postId: log.action === 'blocked' ? null : log.post_id,
		postContent: {
			body: log.post_content_body
		}
	};
}
