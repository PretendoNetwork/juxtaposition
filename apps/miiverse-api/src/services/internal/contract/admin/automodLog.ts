import { z } from 'zod';
import { mapShallowAutomodRule, shallowAutomodRuleSchema } from '@/services/internal/contract/admin/automodRule';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import { automodActionInput, mapAutomodAction } from '@/models/helpers';
import type { AutomodLogMatchList } from '@/models/helpers';
import type { AutomodLog, AutomodRule, User } from '@/prisma/client';

export const automodActionEnum = asOpenapi('AutomodActionEnum', z.enum(automodActionInput));

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
		action: mapAutomodAction(log.action),
		postAuthor: user ? mapShallowUser(user) : null,
		postId: log.action === 'Blocked' ? null : log.postId,
		parentPostId: log.parentPostId,
		communityId: log.communityId,
		matches: (log.matches ?? []) as AutomodLogMatchList,
		postContent: {
			body: log.postContentBody
		}
	};
}
