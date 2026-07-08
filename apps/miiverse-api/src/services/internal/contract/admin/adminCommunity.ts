import { z } from 'zod';
import { communitySchema, mapCommunity } from '@/services/internal/contract/community';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';

export const adminCommunitySchema = communitySchema.extend({
	isRecommended: z.boolean(),
	hasShopPage: z.boolean(),
	platformId: z.number(),
	appData: z.string()
}).openapi('AdminCommunity');

export type AdminCommunityDto = z.infer<typeof adminCommunitySchema>;

export function mapAdminCommunity(comm: HydratedCommunityDocument, followerCount: number): AdminCommunityDto {
	return {
		...mapCommunity(comm, followerCount),
		isRecommended: !!comm.is_recommended,
		hasShopPage: !!comm.has_shop_page,
		platformId: comm.platform_id,
		appData: comm.app_data
	};
}
