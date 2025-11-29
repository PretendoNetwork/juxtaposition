import { Schema, model } from 'mongoose';
import type { SettingsData } from '@/types/miiverse/settings';
import type { HydratedSettingsDocument, ISettings, ISettingsMethods, SettingsModel } from '@/types/mongoose/settings';

const SettingsSchema = new Schema<ISettings, SettingsModel, ISettingsMethods>({
	pid: { type: Number, required: true },
	screen_name: { type: String, required: true },
	account_status: {
		type: Number,
		default: 0
	},
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

SettingsSchema.method<HydratedSettingsDocument>('json', function json(): SettingsData {
	return {
		pid: this.pid,
		screen_name: this.screen_name
	};
});

export const Settings = model<ISettings, SettingsModel>('Settings', SettingsSchema);
