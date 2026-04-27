import { Schema, model } from 'mongoose';
import type { Model, HydratedDocument } from 'mongoose';

enum COMMUNITY_TYPE {
	Main = 0,
	Sub = 1,
	Announcement = 2,
	Private = 3
}

export interface IIconPaths {
	32: string;
	48: string;
	64: string;
	96: string;
	128: string;
}

export interface ICommunityPermissions {
	open: boolean;
	minimum_new_post_access_level: number;
	minimum_new_comment_access_level: number;
	minimum_new_community_access_level: number;
}

export const CommunityShotModes = ['allow', 'block', 'force'] as const;
export type CommunityShotMode = typeof CommunityShotModes[number];

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
	icon_paths?: IIconPaths;
	/** @deprecated Does not actually exist on any community. Use title_id */
	title_ids?: string[]; // Does not exist on any community
	title_id: string[];
	community_id: string;
	olive_community_id: string;
	is_recommended: number;
	app_data: string;
	user_favorites?: number[];
	permissions: ICommunityPermissions;
	shot_mode?: CommunityShotMode;
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

const IconPathsSchema = new Schema<IIconPaths>({
	32: {
		type: String,
		required: true
	},
	48: {
		type: String,
		required: true
	},
	64: {
		type: String,
		required: true
	},
	96: {
		type: String,
		required: true
	},
	128: {
		type: String,
		required: true
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
	icon_paths: { type: IconPathsSchema },
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
		enum: CommunityShotModes,
		default: 'allow'
	},
	shot_extra_title_id: {
		type: [String],
		default: []
	}
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
