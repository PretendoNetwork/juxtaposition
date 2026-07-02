import type { InferSchemaType } from 'mongoose';
import type { PostSchema } from '@/models/post';
import type { ParamPack } from '@/types/common/param-pack';
import type { Community, CommunityShotMode, Post, Self } from '@/api/generated';

export function isPostingAllowed(community: Community, user: Self, parentPost: InferSchemaType<typeof PostSchema> | Post | null): boolean {
	const isReply = !!parentPost;
	const isPublicPostableCommunity = community.type >= 0 && community.type < 2;
	const isOpenCommunity = community.permissions.open;

	const isCommunityAdmin = community.adminPids.includes(user.pid);
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

export function getShotMode(community: Community, pack: ParamPack | null): CommunityShotMode {
	if (pack === null) {
		return 'block';
	}

	// Shots only on matching communities
	if (!community.titleIds.includes(pack.title_id) &&
		!community.extraShotTitleIds?.includes(pack.title_id)) {
		return 'block';
	}

	return community.shotMode;
}
