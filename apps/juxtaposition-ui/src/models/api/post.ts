import { z } from 'zod';

const zBoolNumber = z.union([z.literal(0), z.literal(1)]);
// there are exactly two posts (of 550K) in the DB with IDs that are not 21 chars
const zPostId = z.string().min(19).max(22);
/* This schema (specifically the types and optionals) is trying to be 1:1 to the existing MongoDB,
 * with the intent that we can incrementally fix it as the db is improved.
 * The intent is to not do any transformation here, yet.
 */
export const PostSchema = z.object({
	id: zPostId,
	title_id: z.string().optional(), // u64
	screen_name: z.string(),
	body: z.string(),
	app_data: z.string().optional(), // TODO nintendo base64

	// base64, '' for posts without, undef for PMs
	painting: z.string().optional(),
	// URL fragment, '' for posts without, undef for PMs
	screenshot: z.union([z.literal(''), z.string().startsWith('/')]).optional(),
	screenshot_length: z.number().optional(),

	// sometimes missing, sometimes empty
	search_key: z.array(z.string()).optional(),
	// sometimes missing, sometimes empty
	topic_tag: z.string().optional(),

	community_id: z.string(), // i64?
	created_at: z.coerce.date(),
	// missing on PMs
	feeling_id: z.number().optional(), // todo enum

	is_autopost: zBoolNumber, // boolean
	is_community_private_autopost: zBoolNumber, // boolean
	is_spoiler: zBoolNumber, // boolean
	is_app_jumpable: zBoolNumber, // boolean

	empathy_count: z.number().nonnegative(),
	country_id: z.number(),
	language_id: z.number(),

	mii: z.string(), // .base64(), TODO nintendo base64
	mii_face_url: z.string().url(),

	pid: z.number(),
	platform_id: z.number().optional(), // missing on PMs
	region_id: z.number().optional(), // missing on PMs
	parent: zPostId.optional().nullable(), // both missing and null exist

	reply_count: z.number().nonnegative(),
	verified: z.boolean(),

	message_to_pid: z.number().nullable(),
	removed: z.boolean(),
	removed_by: z.number().optional(), // pid
	removed_at: z.coerce.date().optional(),
	removed_reason: z.string().optional(),
	yeahs: z.array(z.number())
});

export type Post = z.infer<typeof PostSchema>;
