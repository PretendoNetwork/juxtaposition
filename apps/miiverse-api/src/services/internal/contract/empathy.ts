/* !!! HEY
 * This type has a copy in apps/juxtaposition-ui/src/api/empathy.ts
 * Make sure to copy over any modifications! */

import type { IPost } from '@/types/mongoose/post';

export type EmpathyAction = 'add' | 'remove';

export type EmpathyDto = {
	action: EmpathyAction;
	post_id: string;
	empathy_count: number;
};

export function mapEmpathy(action: EmpathyAction, post: IPost): EmpathyDto {
	return {
		action,
		post_id: post.id,
		empathy_count: post.empathy_count
	};
}
