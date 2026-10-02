import { z } from 'zod';
import { mapShallowAutomodRule, shallowAutomodRuleSchema } from '@/services/internal/contract/admin/automodRule';
import { automodAction } from '@/models/automodLog';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { AutomodLog, AutomodRule, User } from '@/prisma/client';

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

export function mapAutomodLog(log: AutomodLog, user: User | null, rule: AutomodRule | null): AutomodLogDto {
	return {
		id: log.id,
		createdAt: log.createdAt,
		rule: rule ? mapShallowAutomodRule(rule) : null,
		action: log.action,
		postAuthor: user ? mapShallowUser(user) : null,
		postId: log.action === 'Blocked' ? null : log.postId,
		parentPostId: log.parentPostId,
		communityId: log.communityId,
		matches: log.matches ?? [],
		postContent: {
			body: log.postContentBody
		}
	};
}
