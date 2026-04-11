import type { InferSchemaType } from 'mongoose';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { CommunitySchema, CommunityShotMode } from '@/models/communities';
import type { PostSchema } from '@/models/post';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { ParamPack } from '@/types/common/param-pack';
import type { Post } from '@/api/generated';

export function isPostingAllowed(community: InferSchemaType<typeof CommunitySchema>, userSettings: HydratedSettingsDocument, parentPost: InferSchemaType<typeof PostSchema> | Post | null, user: GetUserDataResponse): boolean {
	const isReply = !!parentPost;
	const isPublicPostableCommunity = community.type >= 0 && community.type < 2;
	const isOpenCommunity = community.permissions.open;

	const isCommunityAdmin = (community.admins ?? []).includes(user.pid);
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

export function getShotMode(community: InferSchemaType<typeof CommunitySchema>, pack: ParamPack | null): CommunityShotMode {
	if (pack === null) {
		return 'block';
	}

	// Shots only on matching communities
	if (!community.title_id.includes(pack.title_id) &&
		!community.shot_extra_title_id?.includes(pack.title_id)) {
		return 'block';
	}

	return community.shot_mode as CommunityShotMode; // type validated by database
}
