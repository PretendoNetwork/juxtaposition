import crypto from 'node:crypto';
import moment from 'moment';
import { Schema, model } from 'mongoose';
import { getInvalidPostRegex } from '@/util';
import { config } from '@/config';
import type { HydratedPostDocument, IPost, IPostMethods, PostModel } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { PostToJSONOptions } from '@/types/mongoose/post-to-json-options';
import type { PostData, PostPainting, PostScreenshot, PostTopicTag } from '@/types/miiverse/post';

/* Constraints here (default, required etc.) apply to new documents being added
 * See IPost for expected shape of query results
 * If you add default: or required:, please also update IPost and IPostInput!
 */
const PostSchema = new Schema<IPost, PostModel, IPostMethods>({
	id: { type: String }, // generated in save hook
	title_id: { type: String },
	screen_name: { type: String, required: true },
	body: {
		type: String,
		default: ''
	},
	app_data: { type: String },

	painting: { type: String },
	screenshot: { type: String },
	screenshot_thumb: { type: String },
	screenshot_length: { type: Number },
	screenshot_aspect: { type: String },

	search_key: { type: [String] },
	topic_tag: { type: String },

	community_id: { type: String, required: true },
	created_at: { type: Date, required: true },
	feeling_id: { type: Number },

	is_autopost: {
		type: Number,
		default: 0
	},
	is_community_private_autopost: {
		type: Number,
		default: 0
	},
	is_spoiler: {
		type: Number,
		default: 0
	},
	is_app_jumpable: {
		type: Number,
		default: 0
	},

	empathy_count: {
		type: Number,
		default: 0,
		min: 0
	},
	country_id: {
		type: Number,
		default: 49
	},
	language_id: {
		type: Number,
		default: 1
	},

	mii: { type: String, required: true },
	mii_face_url: { type: String, required: true },

	pid: { type: Number, required: true },
	platform_id: { type: Number },
	region_id: { type: Number },
	parent: { type: String },

	reply_count: {
		type: Number,
		default: 0
	},
	verified: {
		type: Boolean,
		default: false
	},

	message_to_pid: {
		type: String,
		default: null
	},

	removed: {
		type: Boolean,
		default: false
	},
	removed_reason: { type: String },
	removed_by: { type: Number },
	removed_at: { type: Date },

	yeahs: { type: [Number], default: [] }
}, {
	id: false // * Disables the .id() getter used by Mongoose in TypeScript. Needed to have our own .id field
});

PostSchema.index({
	community_id: 1,
	removed: 1,
	search_key: 1,
	is_spoiler: 1,
	message_to_pid: 1,
	created_at: -1
});

PostSchema.index({
	yeahs: 1,
	removed: 1,
	created_at: -1
});

PostSchema.index({
	parent: 1,
	removed: 1
});

PostSchema.method<HydratedPostDocument>('del', async function del(reason: string, pid: number) {
	this.removed = true;
	this.removed_by = pid;
	this.removed_reason = reason;
	this.removed_at = new Date();
	await this.save();
});

PostSchema.method<HydratedPostDocument>('generatePostUID', async function generatePostUID(length: number) {
	const id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);

	const inuse = await Post.findOne({ id });

	if (inuse) {
		await this.generatePostUID(length);
	} else {
		this.id = id;
	}
});

PostSchema.method<HydratedPostDocument>('cleanedBody', function cleanedBody(): string {
	return this.body ? this.body.replace(getInvalidPostRegex(), '').replace(/[\n\r]+/gm, '') : '';
});

PostSchema.method<HydratedPostDocument>('cleanedMiiData', function cleanedMiiData(): string {
	return this.mii.replace(/[^A-Za-z0-9+/=]/g, '').replace(/[\n\r]+/gm, '').trim();
});

PostSchema.method<HydratedPostDocument>('cleanedPainting', function cleanedPainting(): string | undefined {
	return this.painting?.replace(/[\n\r]+/gm, '').trim();
});

PostSchema.method<HydratedPostDocument>('cleanedAppData', function cleanedAppData(): string | undefined {
	return this.app_data?.replace(/[^A-Za-z0-9+/=]/g, '').replace(/[\n\r]+/gm, '').trim();
});

PostSchema.method<HydratedPostDocument>('formatPainting', function formatPainting(): PostPainting | undefined {
	if (this.painting) {
		return {
			format: 'tga',
			content: this.cleanedPainting(),
			size: this.painting.length,
			url: `${config.cdnUrl}/paintings/${this.pid}/${this.id}.png`
		};
	}
});

PostSchema.method<HydratedPostDocument>('formatScreenshot', function formatScreenshot(): PostScreenshot | undefined {
	if (this.screenshot && this.screenshot_length) {
		return {
			size: this.screenshot_length,
			url: `${config.cdnUrl}${this.screenshot}`
		};
	}
});

PostSchema.method<HydratedPostDocument>('formatTopicTag', function formatTopicTag(): PostTopicTag | undefined {
	if (this.topic_tag?.trim()) {
		return {
			name: this.topic_tag,
			title_id: this.title_id ?? ''
		};
	}
});

PostSchema.method<HydratedPostDocument>('json', function json(options: PostToJSONOptions, community?: HydratedCommunityDocument): PostData {
	const post: PostData = {
		app_data: undefined, // TODO - I try to keep these fields in the real order they show up in, but idk where this one goes
		body: this.cleanedBody(),
		community_id: this.community_id, // TODO - This sucks
		country_id: this.country_id,
		created_at: moment(this.created_at).format('YYYY-MM-DD HH:MM:SS'),
		feeling_id: this.feeling_id ?? 0,
		id: this.id,
		is_autopost: this.is_autopost ? 1 : 0,
		is_community_private_autopost: this.is_community_private_autopost ? 1 : 0,
		is_spoiler: this.is_spoiler ? 1 : 0,
		is_app_jumpable: this.is_app_jumpable ? 1 : 0,
		empathy_count: this.empathy_count,
		language_id: this.language_id,
		mii: undefined, // * Conditionally set later
		mii_face_url: undefined, // * Conditionally set later
		number: 0,
		painting: this.formatPainting(),
		pid: this.pid,
		platform_id: this.platform_id ?? 1,
		region_id: this.region_id ?? 0,
		reply_count: this.reply_count,
		screen_name: this.screen_name,
		screenshot: this.formatScreenshot(),
		topic_tag: undefined, // * Conditionally set later
		title_id: this.title_id ?? ''
	};

	if (options.app_data) {
		post.app_data = this.cleanedAppData();
	}

	if (options.with_mii) {
		post.mii = this.cleanedMiiData();
		post.mii_face_url = this.mii_face_url;
	}

	if (options.topic_tag) {
		post.topic_tag = this.formatTopicTag();
	}

	if (community) {
		post.community_id = community.community_id;
	}

	// * Some sanity checks
	if (post.feeling_id > 5) {
		post.feeling_id = 0;
	}

	return post;
});

PostSchema.pre('save', async function (next) {
	if (!this.id) {
		await this.generatePostUID(21);
	}

	next();
});

export const Post = model<IPost, PostModel>('Post', PostSchema);
