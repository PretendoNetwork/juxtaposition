import type { InferSchemaType } from 'mongoose';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { PostSchema } from '@/models/post';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { ParamPack } from '@/types/common/param-pack';
import type { Community, CommunityShotMode, Post } from '@/api/generated';

export function isPostingAllowed(community: Community, userSettings: HydratedSettingsDocument, parentPost: InferSchemaType<typeof PostSchema> | Post | null, user: GetUserDataResponse): boolean {
	const isReply = !!parentPost;
	const isPublicPostableCommunity = community.type >= 0 && community.type < 2;
	const isOpenCommunity = community.permissions.open;

	const isCommunityAdmin = community.adminPids.includes(user.pid);
	const isUserLimitedFromPosting = userSettings.account_status !== 0;
	const hasAccessLevelRequirement = isReply
		? user.accessLevel >= community.permissions.minimum_new_comment_access_level
		: user.accessLevel >= community.permissions.minimum_new_post_access_level;

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
