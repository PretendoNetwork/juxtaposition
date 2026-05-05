import { z } from 'zod';
import { mapShallowAutomodRule, shallowAutomodRuleSchema } from '@/services/internal/contract/admin/automodRule';
import { automodAction } from '@/models/automodLog';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { HydratedAutomodLogDocument } from '@/models/automodLog';
import type { HydratedAutomodRuleDocument } from '@/models/automodRules';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const automodActionEnum = asOpenapi('AutomodActionEnum', z.enum(automodAction));

export const automodLogSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	rule: shallowAutomodRuleSchema.nullable(),
	action: automodActionEnum,
	postAuthor: shallowUserSchema.nullable(),
	postId: z.string().nullable(),
	parentPostId: z.string().nullable(),
	communityId: z.string().nullable(),
	matches: z.array(z.object({
		start: z.number(),
		end: z.number()
	})),
	postContent: z.object({
		body: z.string().nullable()
	})
}).openapi('AutomodLog');

export type AutomodLogDto = z.infer<typeof automodLogSchema>;

export function mapAutomodLog(log: HydratedAutomodLogDocument, user: HydratedSettingsDocument | null, rule: HydratedAutomodRuleDocument | null): AutomodLogDto {
	return {
		id: log.id,
		createdAt: log.created_at,
		rule: rule ? mapShallowAutomodRule(rule) : null,
		action: log.action,
		postAuthor: user ? mapShallowUser(user) : null,
		postId: log.action === 'blocked' ? null : log.post_id,
		parentPostId: log.parent_post_id,
		communityId: log.community_id,
		matches: log.matches ?? [],
		postContent: {
			body: log.post_content_body
		}
	};
}
