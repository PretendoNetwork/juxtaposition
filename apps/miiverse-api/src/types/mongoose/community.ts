import type { Model, HydratedDocument } from 'mongoose';
import type { CommunityData } from '@/types/miiverse/community';

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
	title_ids?: string[]; // Does not exist on any community
	title_id: string[];
	community_id: string;
	olive_community_id: string;
	is_recommended: number;
	app_data: string;
	user_favorites?: number[];
	permissions: ICommunityPermissions;
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
	'permissions';
export type ICommunityInput = Omit<ICommunity, CommunityDefaultedFields> & Partial<Pick<ICommunity, CommunityDefaultedFields>>;

export interface ICommunityMethods {
	addUserFavorite(pid: number): Promise<void>;
	delUserFavorite(pid: number): Promise<void>;
	json(): CommunityData;
}

export type CommunityModel = Model<ICommunity, object, ICommunityMethods>;

export type HydratedCommunityDocument = HydratedDocument<ICommunity, ICommunityMethods>;
