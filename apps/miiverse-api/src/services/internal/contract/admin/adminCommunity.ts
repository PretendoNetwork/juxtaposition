import { z } from 'zod';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';

export const adminCommunitySchema = z.object({
	id: z.string(),
	olive_community_id: z.string(),
	parentId: z.string().nullable(),
	adminPids: z.array(z.number()),
	titleIds: z.array(z.string()),
	type: z.number(),
	name: z.string(),
	description: z.string(),
	followerCount: z.number(),
	ctrHeaderImagePath: z.string(),
	hasLegacyCtrHeader: z.boolean(),
	wupHeaderImagePath: z.string(),
	extraShotTitleIds: z.array(z.string())
}).openapi('AdminCommunity');

export type AdminCommunityDto = z.infer<typeof adminCommunitySchema>;

export function mapAdminCommunity(comm: HydratedCommunityDocument): AdminCommunityDto {
	return {
		id: comm.community_id,
		olive_community_id: comm.olive_community_id,
		parentId: comm.parent ?? null,
		titleIds: comm.title_id ?? [],
		type: comm.type,
		adminPids: comm.admins ?? [],
		name: comm.name,
		description: comm.description,
		followerCount: comm.followers,
		ctrHeaderImagePath: comm.ctr_header ?? `/headers/$124}/3DS.png`,
		hasLegacyCtrHeader: !comm.ctr_header,
		wupHeaderImagePath: comm.wup_header ?? `/headers/$124}/WiiU.png`,
		extraShotTitleIds: comm.shot_extra_title_id ?? []
	};
}
