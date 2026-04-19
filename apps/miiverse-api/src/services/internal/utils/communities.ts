import { Community } from '@/models/community';
import type { SelfDto } from '@/services/internal/contract/self';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { HydratedPostDocument } from '@/types/mongoose/post';

export async function generateCommunityId(length?: number | undefined): Promise<string> {
	let id = crypto.getRandomValues(new Uint32Array(1)).toString().substring(0, length);
	const inuse = await Community.findOne({ community_id: id });
	id = (inuse ? await generateCommunityId(length) : id);
	return id;
}

export const accountStatusDisplayMap: Record<number, string> = {
	0: 'Normal',
	1: 'Limited from Posting',
	2: 'Temporary Ban',
	3: 'Permanent Ban'
};

export const communityTypeDisplayMap: Record<number, string> = {
	0: 'Main',
	1: 'Sub',
	2: 'Announcement',
	3: 'Private'
};

export const communityPlatformDisplayMap: Record<number, string> = {
	0: 'Wii U',
	1: '3DS',
	2: 'Both'
};

export function isPostingAllowed(community: HydratedCommunityDocument, user: SelfDto, parentPost: HydratedPostDocument | null): boolean {
	const isReply = !!parentPost;
	const isPublicPostableCommunity = community.type >= 0 && community.type < 2;
	const isOpenCommunity = community.permissions.open;

	const isCommunityAdmin = community.admins?.includes(user.pid) ?? false;
	const isUserLimitedFromPosting = !user.permissions.posting;
	const hasAccessLevelRequirement = isReply
		? user.permissions.accessLevel >= community.permissions.minimum_new_comment_access_level
		: user.permissions.accessLevel >= community.permissions.minimum_new_post_access_level;

	if (isUserLimitedFromPosting) {
		return false;
	}

	if (isCommunityAdmin) {
		return true; // admins can always post (if not limited)
	}

	if (!hasAccessLevelRequirement) {
		return false;
	}

	return isReply ? isOpenCommunity : isPublicPostableCommunity;
}
