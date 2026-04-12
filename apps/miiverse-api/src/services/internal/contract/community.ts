import { z } from 'zod';
import { COMMUNITY_TYPE } from '@/types/mongoose/community';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';

export const communityCategory = z.enum([
	'listed', // All publicly listed communities (announcement/main)
	'sub', // Subcommunities
	'private' // Private communities
]).openapi('CommunityCategoryEnum');
export type CommunityCategoryEnum = z.infer<typeof communityCategory>;

export const communityShotSchema = asOpenapi('CommunityShotMode', z.enum(['allow', 'block', 'force']));
export type CommunityShotMode = z.infer<typeof communityShotSchema>;

export const communityPermissionSchema = z.object({
	open: z.boolean(),
	minimum_new_post_access_level: z.number(),
	minimum_new_comment_access_level: z.number(),
	minimum_new_community_access_level: z.number()
}).openapi('CommunityPermissions');

export const communityIconsSchema = z.object({
	32: z.string(),
	48: z.string(),
	64: z.string(),
	96: z.string(),
	128: z.string()
}).openapi('CommunityIcons');

export const communitySchema = z.object({
	id: z.string(),
	olive_community_id: z.string(),
	parentId: z.string().nullable(),
	permissions: communityPermissionSchema,
	adminPids: z.array(z.number()),
	titleIds: z.array(z.string()),
	type: z.number(),
	category: communityCategory,
	name: z.string(),
	description: z.string(),
	followerCount: z.number(),
	ctrHeaderImagePath: z.string(),
	hasLegacyCtrHeader: z.boolean(),
	wupHeaderImagePath: z.string(),
	iconImagePaths: communityIconsSchema,
	shotMode: communityShotSchema.nullable(),
	extraShotTitleIds: z.array(z.string())
}).openapi('Community');

export type CommunityDto = z.infer<typeof communitySchema>;

export const communityStatsSchema = z.object({
	id: z.string(),
	olive_community_id: z.string(),
	totalPosts: z.number()
}).openapi('CommunityStats');

export type CommunityStatsDto = z.infer<typeof communityStatsSchema>;

export function categoryToCommunityTypes(cat: CommunityCategoryEnum): number[] {
	if (cat === 'private') {
		return [COMMUNITY_TYPE.Private];
	}
	if (cat === 'sub') {
		return [COMMUNITY_TYPE.Sub];
	}
	return [COMMUNITY_TYPE.Main, COMMUNITY_TYPE.Announcement];
}

export function mapCommunityType(type: number): CommunityCategoryEnum {
	if (type === COMMUNITY_TYPE.Private) {
		return 'private';
	}
	if (type === COMMUNITY_TYPE.Sub) {
		return 'sub';
	}
	return 'listed';
}

export function mapCommunity(comm: HydratedCommunityDocument): CommunityDto {
	const imageId = comm.parent ? comm.parent : comm.olive_community_id;
	return {
		id: comm.community_id,
		olive_community_id: comm.olive_community_id,
		parentId: comm.parent ?? null,
		titleIds: comm.title_id ?? [],
		type: comm.type,
		permissions: comm.permissions,
		adminPids: comm.admins ?? [],
		category: mapCommunityType(comm.type),
		name: comm.name,
		description: comm.description,
		followerCount: comm.followers,
		ctrHeaderImagePath: comm.ctr_header ?? `/headers/${imageId}/3DS.png`,
		hasLegacyCtrHeader: !comm.ctr_header,
		wupHeaderImagePath: comm.wup_header ?? `/headers/${imageId}/WiiU.png`,
		shotMode: comm.shot_mode ?? null,
		extraShotTitleIds: comm.shot_extra_title_id ?? [],
		iconImagePaths: {
			32: comm.icon_paths?.[32] ?? `/icons/${imageId}/32.png`,
			48: comm.icon_paths?.[48] ?? `/icons/${imageId}/48.png`,
			64: comm.icon_paths?.[64] ?? `/icons/${imageId}/64.png`,
			96: comm.icon_paths?.[96] ?? `/icons/${imageId}/96.png`,
			128: comm.icon_paths?.[128] ?? `/icons/${imageId}/128.png`
		}
	};
}

export function mapCommunityStats(comm: HydratedCommunityDocument, totalPosts: number): CommunityStatsDto {
	return {
		id: comm.community_id,
		olive_community_id: comm.olive_community_id,
		totalPosts
	};
}
