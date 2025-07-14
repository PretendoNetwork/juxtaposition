import crypto from 'node:crypto';
import { Schema, model } from 'mongoose';
import { MongoError } from 'mongodb';
import type { CommunityData } from '@/types/miiverse/community';
import type { ICommunity, ICommunityMethods, CommunityModel, ICommunityPermissions, HydratedCommunityDocument, ICommunityInput } from '@/types/mongoose/community';

const PermissionsSchema = new Schema<ICommunityPermissions>({
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
 */
const CommunitySchema = new Schema<ICommunity, CommunityModel, ICommunityMethods>({
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

CommunitySchema.method<HydratedCommunityDocument>('addUserFavorite', async function addUserFavorite(pid: number): Promise<void> {
	if (this.user_favorites === undefined) {
		this.user_favorites = [pid];
	} else if (!this.user_favorites.includes(pid)) {
		this.user_favorites.push(pid);
	}

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('delUserFavorite', async function delUserFavorite(pid: number): Promise<void> {
	if (this.user_favorites !== undefined && this.user_favorites.includes(pid)) {
		this.user_favorites.splice(this.user_favorites.indexOf(pid), 1);
	}

	await this.save();
});

CommunitySchema.method<HydratedCommunityDocument>('json', function json(): CommunityData {
	return {
		community_id: this.community_id,
		name: this.name,
		description: this.description,
		icon: this.icon.replace(/[^A-Za-z0-9+/=\s]/g, ''),
		icon_3ds: '',
		pid: this.owner ?? 0,
		app_data: this.app_data.replace(/[^A-Za-z0-9+/=\s]/g, ''),
		is_user_community: '0'
	};
});

export const Community = model<ICommunity, CommunityModel>('Community', CommunitySchema);

export async function tryCreateCommunity(community: Omit<ICommunityInput, 'community_id' | 'olive_community_id'>, attempts: number = 0): Promise<HydratedCommunityDocument> {
	// If we're in too deep bail out
	if (attempts > 10) {
		throw new Error('Community creation failed - ID space exhausted?');
	}

	// Community ID is a random 32-bit int, but ensure larger than 524288. Values lower than this
	// are reserved for game-specific hardcoding
	const community_id = (crypto.randomBytes(4).readUInt32BE(0) | 0x80000).toString();
	// Olive community ID is random 64-bit, but some games (MK8?) seem to prefer if the top bit is set
	const olive_community_id = (crypto.randomBytes(8).readBigUInt64BE(0) | (1n << 63n)).toString();

	const document = {
		community_id,
		olive_community_id,
		...community
	};

	let hydrated: HydratedCommunityDocument;
	try {
		hydrated = await Community.create(document);
	} catch (err) {
		// Duplicate key
		if (err instanceof MongoError && err.code == 11000) {
			// Roll again
			return tryCreateCommunity(community, attempts + 1);
		} else {
			throw err;
		}
	}

	return hydrated;
}
