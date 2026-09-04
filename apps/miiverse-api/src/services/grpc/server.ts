import { ServerError, Status } from 'nice-grpc';
import { deleteAccountData } from '@/services/grpc/deleteAccountData';
import { getCommunityByID } from '@/services/grpc/getCommunityByID';
import { getCommunityByTitleID } from '@/services/grpc/getCommunityByTitleID';
import { getCommunityPosts } from '@/services/grpc/getCommunityPosts';
import { getPost } from '@/services/grpc/getPost';
import { getPostReplies } from '@/services/grpc/getPostReplies';
import { getUserPosts } from '@/services/grpc/getUserPosts';
import type { MiiverseServiceImplementation } from '@pretendonetwork/grpc/miiverse/v2/miiverse_service';

export const miiverseDefinition: MiiverseServiceImplementation = {
	deleteAccountData,
	sMMRequestPostId: async (_request) => {
		throw new ServerError(Status.UNIMPLEMENTED, 'Not implemented');
	},
	getCommunityByID,
	getCommunityByTitleID,
	getPost,
	getPostReplies,
	getCommunityPosts,
	getUserPosts
};
