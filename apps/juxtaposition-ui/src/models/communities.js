import { Schema, model } from 'mongoose';

const PermissionsSchema = new Schema({
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

const IconPathsSchema = new Schema({
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

export const CommunitySchema = new Schema({
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
	}
});

CommunitySchema.methods.upEmpathy = async function () {
	const empathy = this.get('empathy_count');
	this.set('empathy_count', empathy + 1);

	await this.save();
};

CommunitySchema.methods.downEmpathy = async function () {
	const empathy = this.get('empathy_count');
	this.set('empathy_count', empathy - 1);

	await this.save();
};

CommunitySchema.methods.upFollower = async function () {
	const followers = this.get('followers');
	this.set('followers', followers + 1);

	await this.save();
};

CommunitySchema.methods.downFollower = async function () {
	const followers = this.get('followers');
	this.set('followers', followers - 1);

	await this.save();
};

export const COMMUNITY = model('COMMUNITY', CommunitySchema);
