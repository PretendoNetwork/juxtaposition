import { z } from 'zod';
import type { IPost } from '@/types/mongoose/post';

export const empathyActionSchema = z.enum(['add', 'remove']).openapi('EmpathyActionEnum');
export type EmpathyAction = z.infer<typeof empathyActionSchema>;

export const empathySchema = z.object({
	action: empathyActionSchema,
	post_id: z.string(),
	empathy_count: z.number()
}).openapi('EmpathyAction');
export type EmpathyDto = z.infer<typeof empathySchema>;

export function mapEmpathy(action: EmpathyAction, post: IPost): EmpathyDto {
	return {
		action,
		post_id: post.id,
		empathy_count: post.empathy_count
	};
}
