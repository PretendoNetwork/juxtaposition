/* !!! HEY
 * This type has a copy in apps/juxtaposition-ui/src/api/community.ts
 * Make sure to copy over any modifications! */

import type { ICommunity } from '@/types/mongoose/community';

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

/**
 * Maps a Community from the databse to the frontend contract community type.
 */
export function mapCommunity(com: ICommunity): CommunityDto {
	return {
		community_id: com.community_id,
		olive_community_id: com.olive_community_id,
		parent: com.parent ?? null,
		name: com.name,
		description: com.description,
		followers: com.followers,
		wup_header: com.wup_header,
		ctr_header: com.ctr_header,
		permissions: {
			open: com.permissions.open,
			minimum_new_post_access_level: com.permissions.minimum_new_post_access_level,
			minimum_new_comment_access_level: com.permissions.minimum_new_comment_access_level,
			minimum_new_community_access_level: com.permissions.minimum_new_community_access_level
		}
	};
}
