import { apiFetchUser } from '@/fetch';
import type { PageControls } from '@/api/common';
import type { PageDto } from '@/api/page';
import type { UserTokens } from '@/types/juxt/tokens';

/* !!! HEY
 * This type lives in apps/miiverse-api/src/services/internal/contract/community.ts
 * Modify it there and copy-paste here! */

/* This type is the contract for the frontend. If we make changes to the db, this shape should be kept. */
export type CommunityDto = {
	community_id: string;
	olive_community_id: string;
	parent: string | null;
	name: string;
	description: string;
	followers: number;
	wup_header?: string;
	ctr_header?: string;
	permissions: {
		open: boolean;
		minimum_new_post_access_level: number;
		minimum_new_comment_access_level: number;
		minimum_new_community_access_level: number;
	};
};

export async function listCommunities(tokens: UserTokens, page?: PageControls): Promise<PageDto<CommunityDto> | null> {
	return await apiFetchUser<PageDto<CommunityDto>>(tokens, `/api/v1/communities`, {
		query: {
			offset: page?.offset,
			limit: page?.limit
		}
	});
}

export async function searchCommunities(tokens: UserTokens, keyword: string, page?: PageControls): Promise<PageDto<CommunityDto> | null> {
	return await apiFetchUser<PageDto<CommunityDto>>(tokens, `/api/v1/communities/search`, {
		method: 'POST',
		query: {
			offset: page?.offset,
			limit: page?.limit
		},
		body: {
			keyword
		}
	});
}

export async function listSubcommunities(tokens: UserTokens, parentId: string, page?: PageControls): Promise<PageDto<CommunityDto> | null> {
	return await apiFetchUser<PageDto<CommunityDto>>(tokens, `/api/v1/communities`, {
		query: {
			parent_id: parentId,
			offset: page?.offset,
			limit: page?.limit
		}
	});
}
