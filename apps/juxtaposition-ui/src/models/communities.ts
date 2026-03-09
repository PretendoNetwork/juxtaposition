import { Schema, model } from 'mongoose';
import type { Model, HydratedDocument } from 'mongoose';

enum COMMUNITY_TYPE {
	Main = 0,
	Sub = 1,
	Announcement = 2,
	Private = 3
}

export interface ICommunityPermissions {
	open: boolean;
	minimum_new_post_access_level: number;
	minimum_new_comment_access_level: number;
	minimum_new_community_access_level: number;
}

/* This type needs to reflect "reality" as it is in the DB
 * Thus, all the optionals, since some legacy documents are missing many fields
 */
export interface ICommunity {
	platform_id: number; // int
	name: string;
	description: string;
	open?: boolean;
	allows_comments?: boolean;
	type: COMMUNITY_TYPE;
	parent?: string | null; // TFH community is undefined
	admins?: number[];
	owner?: number;
	created_at: Date;
	empathy_count: number;
	followers: number;
	has_shop_page: number;
	icon: string;
	ctr_header?: string;
	wup_header?: string;
	title_ids?: string[]; // Does not exist on any community
	title_id: string[];
	community_id: string;
	olive_community_id: string;
	is_recommended: number;
	app_data: string;
	user_favorites?: number[];
	permissions: ICommunityPermissions;
	shot_mode?: string;
	shot_extra_title_id?: string[];
}
// Fields that have "default: " in the Mongoose schema should also be listed here to make them optional
// on input but not output
type CommunityDefaultedFields =
	'open' |
	'allows_comments' |
	'type' |
	'parent' |
	'admins' |
	'created_at' |
	'empathy_count' |
	'followers' |
	'has_shop_page' |
	'icon' |
	'title_ids' |
	'title_id' |
	'is_recommended' |
	'app_data' |
	'user_favorites' |
	'permissions' |
	'shot_mode' |
	'shot_extra_title_id';
export type ICommunityInput = Omit<ICommunity, CommunityDefaultedFields> & Partial<Pick<ICommunity, CommunityDefaultedFields>>;

export interface ICommunityMethods {
	upEmpathy(): Promise<void>;
	downEmpathy(): Promise<void>;
	upFollower(): Promise<void>;
	downFollower(): Promise<void>;
}

export type CommunityModel = Model<ICommunity, object, ICommunityMethods>;
export type HydratedCommunityDocument = HydratedDocument<ICommunity, ICommunityMethods>;

export const PermissionsSchema = new Schema<ICommunityPermissions>({
	open: {
		type: Boolean,
		default: true
	},
	minimum_new_post_access_level: {
		type: Number,
		default: 0
	},
	minimum_new_comment_access_level: {
		type: Number,
		default: 0
	},
	minimum_new_community_access_level: {
		type: Number,
		default: 3
	}
});

/* Constraints here (default, required etc.) apply to new documents being added
 * See ICommunity for expected shape of query results
 * If you add default: or required:, please also update ICommunity and ICommunityInput!
 *
 * Temporarily exported for legacy InferSchemaType users
 */
export const CommunitySchema = new Schema<ICommunity, CommunityModel, ICommunityMethods>({
	platform_id: {
		type: Number,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},

	open: {
		type: Boolean,
		default: true
	},
	allows_comments: {
		type: Boolean,
		default: true
	},
	/**
     * 0: Main Community
     * 1: Sub-Community
     * 2: Announcement Community
     * 3: Private Community
     */
	type: {
		type: Number,
		default: 0
	},
	parent: {
		type: String,
		default: null
	},
	admins: {
		type: [Number],
		default: undefined
	},
	owner: Number,
	created_at: {
		type: Date,
		default: new Date()
	},
	empathy_count: {
		type: Number,
		default: 0
	},
	followers: {
		type: Number,
		default: 0
	},
	has_shop_page: {
		type: Number,
		default: 0
	},
	icon: {
		type: String,
		required: true
	},
	ctr_header: { type: String },
	wup_header: { type: String },
	title_ids: {
		type: [String],
		default: undefined
	},
	title_id: {
		type: [String],
		default: []
	},
	community_id: {
		type: String,
		required: true
	},
	olive_community_id: {
		type: String,
		required: true
	},
	is_recommended: {
		type: Number,
		default: 0
	},
	app_data: {
		type: String,
		default: ''
	},
	user_favorites: {
		type: [Number],
		default: []
	},
	permissions: {
		type: PermissionsSchema,
		default: {}
	},
	shot_mode: {
		type: String,
		default: 'allow'
	},
	shot_extra_title_id: {
		type: [String],
		default: []
	}
});

CommunitySchema.method<HydratedCommunityDocument>('upEmpathy', async function () {
	const empathy = this.get('empathy_count');
	this.set('empathy_count', empathy + 1);

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('downEmpathy', async function () {
	const empathy = this.get('empathy_count');
	this.set('empathy_count', empathy - 1);

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('upFollower', async function () {
	const followers = this.get('followers');
	this.set('followers', followers + 1);

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('downFollower', async function () {
	const followers = this.get('followers');
	this.set('followers', followers - 1);

	await this.save();
});

export const Community = model<ICommunity, CommunityModel>('Community', CommunitySchema);
export const COMMUNITY = Community;
