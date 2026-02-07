import type { IPost } from '@/types/mongoose/post';

/* !!! HEY
 * This type has a copy in apps/juxtaposition-ui/src/api/post.ts
 * Make sure to copy over any modifications! */

/* This type is the contract for the frontend. If we make changes to the db, this shape should be kept. */
export type PostDto = {
	id: string;
	title_id?: string; // number
	screen_name: string;
	body: string;
	app_data?: string; // nintendo base64

	painting?: string; // base64 or '', undef for PMs
	screenshot?: string; // URL frag (leading /) or '', undef for PMs
	screenshot_thumb?: string; // URL frag (leading /) or '', undef for PMs/old posts
	screenshot_length?: number;
	screenshot_aspect?: string; // '4:3' '5:3' '16:9'

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
 * Maps a Post from the databse to the frontend contract post type.
 * Doesn't do much for now, but as the database changes, this abstraction will carry more.
 * @param post Database post type
 * @returns API/frontend post type
 */
export function mapPost(post: IPost): PostDto {
	return {
		id: post.id,
		title_id: post.title_id,
		screen_name: post.screen_name,
		body: post.body,
		app_data: post.app_data,

		painting: post.painting,
		screenshot: post.screenshot,
		screenshot_thumb: post.screenshot_thumb,
		screenshot_length: post.screenshot_length,
		screenshot_aspect: post.screenshot_aspect,

		search_key: post.search_key,
		topic_tag: post.topic_tag,

		community_id: post.community_id,
		created_at: post.created_at.toISOString(),
		feeling_id: post.feeling_id,

		is_autopost: !!post.is_autopost,
		is_community_private_autopost: !!post.is_community_private_autopost,
		is_spoiler: !!post.is_spoiler,
		is_app_jumpable: !!post.is_app_jumpable,

		empathy_count: post.empathy_count,
		country_id: post.country_id,
		language_id: post.language_id,

		mii: post.mii,
		mii_face_url: post.mii_face_url,

		pid: post.pid,
		platform_id: post.platform_id,
		region_id: post.region_id,
		parent: post.parent ?? null,

		reply_count: post.reply_count,
		verified: post.verified,

		message_to_pid: post.message_to_pid,
		removed: post.removed,
		removed_by: post.removed_by,
		removed_at: post.removed_at?.toISOString(),
		removed_reason: post.removed_reason,

		yeahs: post.yeahs
	};
}
