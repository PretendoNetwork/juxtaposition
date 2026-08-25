import { z } from 'zod';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';

export const followActionSchema = z.enum(['follow', 'unfollow']).openapi('FollowActionEnum');
export type FollowAction = z.infer<typeof followActionSchema>;

export const followSchema = z.object({
	action: followActionSchema,
	id: z.string(), // community IDs are strings
	follower_count: z.number()
}).openapi('FollowAction');
export type FollowDto = z.infer<typeof followSchema>;

export function mapFollowUser(action: FollowAction, targetPid: number, targetFollowCount: number): FollowDto {
	return {
		action,
		id: `${targetPid}`,
		follower_count: targetFollowCount
	};
}

export function mapFollowCommunity(action: FollowAction, target: HydratedCommunityDocument, followCount: number): FollowDto {
	return {
		action,
		id: target.olive_community_id,
		follower_count: followCount
	};
}
