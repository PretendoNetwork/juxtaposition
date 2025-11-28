/* !!! HEY
 * This type has a copy in apps/miiverse-api/src/services/internal/contract/empathy.ts
 * Make sure to copy over any modifications! */

import { apiFetchUser } from '@/fetch';
import type { UserTokens } from '@/fetch';

export type EmpathyAction = 'add' | 'remove';

export type EmpathyDto = {
	action: EmpathyAction;
	post_id: string;
	empathy_count: number;
};

export async function addEmpathyById(tokens: UserTokens, post_id: string): Promise<EmpathyDto | null> {
	const result = await apiFetchUser<EmpathyDto>(tokens, `/api/v1/posts/${post_id}/empathies`, {
		method: 'POST',
		body: {
			action: 'add'
		}
	});
	return result;
}

export async function removeEmpathyById(tokens: UserTokens, post_id: string): Promise<EmpathyDto | null> {
	const result = await apiFetchUser<EmpathyDto>(tokens, `/api/v1/posts/${post_id}/empathies`, {
		method: 'POST',
		body: {
			action: 'remove'
		}
	});
	return result;
}
