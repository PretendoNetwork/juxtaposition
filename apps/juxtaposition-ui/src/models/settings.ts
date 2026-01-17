import { Schema, model } from 'mongoose';
import type { HydratedDocument, Model } from 'mongoose';

/* This type needs to reflect "reality" as it is in the DB
 * Thus, all the optionals, since some legacy documents are missing many fields
 */
export interface ISettings {
	pid: number;
	screen_name: string;
	account_status: number;
	ban_lift_date?: Date | null;
	banned_by?: number | null;
	ban_reason?: string | null;
	profile_comment?: string | null;
	profile_comment_visibility: boolean;
	game_skill: number;
	game_skill_visibility: boolean;
	birthday_visibility: boolean;
	relationship_visibility: boolean;
	country_visibility: boolean;
	profile_favorite_community_visibility: boolean;
	receive_notifications: boolean;
	created_at?: Date;
	last_active?: Date;
}
// Fields that have "default: " in the Mongoose schema should also be listed here to make them optional
// on input but not output
type SettingsDefaultedFields =
	'account_status' |
	'ban_lift_date' |
	'banned_by' |
	'ban_reason' |
	'profile_comment' |
	'profile_comment_visibility' |
	'game_skill' |
	'game_skill_visibility' |
	'birthday_visibility' |
	'relationship_visibility' |
	'country_visibility' |
	'profile_favorite_community_visibility' |
	'receive_notifications' |
	'created_at' |
	'last_active';
export type ISettingsInput = Omit<ISettings, SettingsDefaultedFields> & Partial<Pick<ISettings, SettingsDefaultedFields>>;

export interface ISettingsMethods {
	updateComment(comment: string | null): Promise<void>;
	updateSkill(skill: number): Promise<void>;
	commentVisible(active: boolean): Promise<void>;
	skillVisible(active: boolean): Promise<void>;
	birthdayVisible(active: boolean): Promise<void>;
	relationshipVisible(active: boolean): Promise<void>;
	countryVisible(active: boolean): Promise<void>;
	favCommunityVisible(active: boolean): Promise<void>;
}

export type SettingsModel = Model<ISettings, {}, ISettingsMethods>;
export type HydratedSettingsDocument = HydratedDocument<ISettings, ISettingsMethods>;

export const SettingsSchema = new Schema<ISettings, SettingsModel, ISettingsMethods>({
	pid: { type: Number, required: true },
	screen_name: { type: String, required: true },
	account_status: {
		type: Number,
		default: 0
	},
	// TODO: Move bans to their own collection. User settings should be scoped to older the user
	ban_lift_date: {
		type: Date,
		default: null
	},
	banned_by: {
		type: Number,
		default: null
	},
	ban_reason: {
		type: String,
		default: null
	},
	profile_comment: {
		type: String,
		default: null
	},
	profile_comment_visibility: {
		type: Boolean,
		default: true
	},
	game_skill: {
		type: Number,
		default: 0
	},
	game_skill_visibility: {
		type: Boolean,
		default: true
	},
	birthday_visibility: {
		type: Boolean,
		default: false
	},
	relationship_visibility: {
		type: Boolean,
		default: false
	},
	country_visibility: {
		type: Boolean,
		default: false
	},
	profile_favorite_community_visibility: {
		type: Boolean,
		default: true
	},
	receive_notifications: {
		type: Boolean,
		default: true
	},
	created_at: {
		type: Date,
		default: Date.now()
	},
	last_active: {
		type: Date,
		default: Date.now(),
		index: true
	}
});

SettingsSchema.method<HydratedSettingsDocument>('updateComment', async function (comment) {
	this.set('profile_comment', comment);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('updateSkill', async function (skill) {
	this.set('game_skill', skill);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('commentVisible', async function (active) {
	this.set('profile_comment_visibility', active);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('skillVisible', async function (active) {
	this.set('game_skill_visibility', active);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('birthdayVisible', async function (active) {
	this.set('birthday_visibility', active);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('relationshipVisible', async function (active) {
	this.set('relationship_visibility', active);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('countryVisible', async function (active) {
	this.set('country_visibility', active);
	await this.save();
});

SettingsSchema.method<HydratedSettingsDocument>('favCommunityVisible', async function (active) {
	this.set('profile_favorite_community_visibility', active);
	await this.save();
});

export const Settings = model<ISettings, SettingsModel>('Setting', SettingsSchema);
export const SETTINGS = Settings;
