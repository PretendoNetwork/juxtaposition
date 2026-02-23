import type { Model, Types, HydratedDocument } from 'mongoose';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { PostToJSONOptions } from '@/types/mongoose/post-to-json-options';
import type { PostData, PostPainting, PostScreenshot, PostTopicTag } from '@/types/miiverse/post';

/* This type needs to reflect "reality" as it is in the DB
 * Thus, all the optionals, since some legacy documents are missing many fields
 */
export interface IPost {
	id: string;
	title_id?: string; // u64
	screen_name: string;
	body: string;
	app_data?: string; // nintendo base64

	painting?: string; // base64, can be empty or undefined
	painting_img?: string; // url fragment (leading /), can be empty or undefined
	painting_big?: string; // url fragment (leading /), can be empty or undefined
	screenshot?: string; // url fragment (leading /), can be empty or undefined
	screenshot_big?: string; // url fragment (leading /), can be empty or undefined
	screenshot_thumb?: string; // url fragment (leading /), can be empty or undefined
	screenshot_length?: number;
	screenshot_aspect?: string; // '4:3' '5:3' '16:9'

	search_key?: string[]; // can be empty or undefined
	topic_tag?: string;

	community_id: string; // actually a number
	created_at: Date;
	feeling_id?: number; // missing on PMs

	is_autopost: number; // 0 | 1
	is_community_private_autopost: number; // 0 | 1
	is_spoiler: number; // 0 | 1
	is_app_jumpable: number; // 0 | 1

	empathy_count: number;
	country_id: number;
	language_id: number;

	mii: string; // nintendo base64
	mii_face_url: string; // fully qualified (usually cdn. or r2-cdn.)

	pid: number;
	platform_id?: number; // missing on PMs
	region_id?: number; // missing on PMs
	parent?: string | null; // both undef and null exist in db

	reply_count: number;
	verified: boolean;

	message_to_pid: string | null;

	removed: boolean;
	removed_reason?: string;
	removed_by?: number;
	removed_at?: Date;

	yeahs: Types.Array<number>;
}
// Fields that have "default: " in the Mongoose schema should also be listed here to make them optional
// on input but not output
// We really need an ORM
type PostDefaultedFields =
	'id' | // generated in save hook
	'body' |
	'is_autopost' |
	'is_community_private_autopost' |
	'is_spoiler' |
	'is_app_jumpable' |
	'empathy_count' |
	'country_id' |
	'language_id' |
	'reply_count' |
	'verified' |
	'message_to_pid' |
	'removed' |
	'yeahs';
export type IPostInput = Omit<IPost, PostDefaultedFields> & Partial<Pick<IPost, PostDefaultedFields>>;

export interface IPostMethods {
	del(reason: string, pid: number): Promise<void>;
	generatePostUID(length: number): Promise<void>;
	cleanedBody(): string;
	cleanedMiiData(): string;
	cleanedPainting(): string;
	cleanedAppData(): string;
	formatPainting(): PostPainting | undefined;
	formatScreenshot(): PostScreenshot | undefined;
	formatTopicTag(): PostTopicTag | undefined;
	json(options: PostToJSONOptions, community?: HydratedCommunityDocument): PostData;
}

export type PostModel = Model<IPost, {}, IPostMethods>;

export type HydratedPostDocument = HydratedDocument<IPost, IPostMethods>;
