import type { Model, HydratedDocument } from 'mongoose';
import type { SettingsData } from '@/types/miiverse/settings';

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
	json(): SettingsData;
}

export type SettingsModel = Model<ISettings, {}, ISettingsMethods>;

export type HydratedSettingsDocument = HydratedDocument<ISettings, ISettingsMethods>;
