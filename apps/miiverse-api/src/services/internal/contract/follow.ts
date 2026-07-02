import { z } from 'zod';
import type { IContent } from '@/types/mongoose/content';

export const followActionSchema = z.enum(['follow', 'unfollow']).openapi('FollowActionEnum');
export type FollowAction = z.infer<typeof followActionSchema>;

export const followSchema = z.object({
	action: followActionSchema,
	id: z.string(), // community IDs are strings
	follower_count: z.number()
}).openapi('FollowAction');
export type FollowDto = z.infer<typeof followSchema>;

export function mapFollowUser(action: FollowAction, targetUser: IContent): FollowDto {
	return {
		action,
		id: `${targetUser.pid}`,
		follower_count: targetUser.following_users.length
	};
}
