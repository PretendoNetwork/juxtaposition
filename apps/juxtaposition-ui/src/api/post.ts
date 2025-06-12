import { apiFetchUser } from '@/fetch';
import type { UserTokens } from '@/fetch';

/* !!! HEY
 * This type lives in apps/miiverse-api/src/services/internal/contract/post.ts
 * Modify it there and copy-paste here! */

/* This type is the contract for the frontend. If we make changes to the db, this shape should be kept. */
export type PostDto = {
	id: string;
	title_id?: string; // number
	screen_name: string;
	body: string;
	app_data?: string; // nintendo base64

	painting?: string; // base64 or '', undef for PMs
	screenshot?: string; // URL frag (leading /) or '', undef for PMs
	screenshot_length?: number;

	search_key?: string[]; // can be []
	topic_tag?: string; // can be ''

	community_id: string; // number
	created_at: string; // ISO Z
	feeling_id?: number;

	is_autopost: boolean;
	is_community_private_autopost: boolean;
	is_spoiler: boolean;
	is_app_jumpable: boolean;

	empathy_count: number;
	country_id: number;
	language_id: number;

	mii: string; // nintendo base64
	mii_face_url: string; // full URL (cdn., r2-cdn.)

	pid: number;
	platform_id?: number;
	region_id?: number;
	parent: string | null;

	reply_count: number;
	verified: boolean;

	message_to_pid: string | null;
	removed: boolean;
	removed_by?: number;
	removed_at?: string; // ISO Z
	removed_reason?: string;

	yeahs: number[];
};

/**
 * Fetches a Post for a given ID.
 * @param tokens User to perform fetch as. Responses will be according to this users' permissions (user, moderator etc.)
 * @param post_id The ID of the post to get.
 * @returns Post object
 */
export async function getPostById(tokens: UserTokens, post_id: string): Promise<PostDto | null> {
	const post = await apiFetchUser<PostDto>(tokens, `/api/v1/posts/${post_id}`);
	return post;
}
