import { z } from 'zod';
import type { IPost } from '@/types/mongoose/post';

export const postSchema = z.object({
	id: z.string(),
	title_id: z.string().optional(), // number as string
	screen_name: z.string(),
	body: z.string(),
	app_data: z.string().optional(), // nintendo base64

	painting: z.string().optional(), // base64 or '', undef for PMs
	painting_img: z.string().optional(), // URL frag (leading /) or '', undef for PMs
	painting_big: z.string().optional(), // URL frag (leading /) or '', undef for PMs
	screenshot: z.string().optional(), // URL frag (leading /) or '', undef for PMs
	screenshot_big: z.string().optional(), // URL frag (leading /) or '', undef for PMs/old posts
	screenshot_thumb: z.string().optional(), // URL frag (leading /) or '', undef for PMs/old posts
	screenshot_length: z.number().optional(),
	screenshot_aspect: z.string().optional(), // '4:3' '5:3' '16:9'

	search_key: z.array(z.string()).optional(),
	topic_tag: z.string().optional(),

	community_id: z.string(), // number
	created_at: z.string(), // ISO Z
	feeling_id: z.number().optional(),

	is_autopost: z.boolean(),
	is_community_private_autopost: z.boolean(),
	is_spoiler: z.boolean(),
	is_app_jumpable: z.boolean(),

	empathy_count: z.number(),
	country_id: z.number(),
	language_id: z.number(),

	mii: z.string(), // nintendo base64
	mii_face_url: z.string(), // full URL (cdn., r2-cdn.)

	pid: z.number(),
	platform_id: z.number().optional(),
	region_id: z.number().optional(),
	parent: z.string().nullable(),

	reply_count: z.number(),
	verified: z.boolean(),

	message_to_pid: z.string().nullable(),

	removed: z.boolean(),
	removed_by: z.number().optional(),
	removed_at: z.string().optional(), // ISO Z
	removed_reason: z.string().optional(),

	yeahs: z.array(z.number())
}).openapi('Post');

export type PostDto = z.infer<typeof postSchema>;

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
		painting_img: post.painting_img,
		painting_big: post.painting_big,
		screenshot: post.screenshot,
		screenshot_big: post.screenshot_big,
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
