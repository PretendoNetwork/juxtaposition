import { ServerError, Status } from 'nice-grpc';
import { Post } from '@/models/post';
import type { PostData } from '@pretendonetwork/grpc/miiverse/v2/post';
import type { GetPostRepliesRequest, GetPostRepliesResponse } from '@pretendonetwork/grpc/miiverse/v2/get_post_replies_rpc';
import type { CommunityPostsQuery } from '@/types/mongoose/community-posts-query';
import type { HydratedPostDocument } from '@/types/mongoose/post';

export async function getPostReplies(req: GetPostRepliesRequest): Promise<GetPostRepliesResponse> {
	const post = await Post.findOne({
		id: req.postId
	});

	if (!post) {
		throw new ServerError(Status.NOT_FOUND, `Post with ID ${req.postId} was not found`);
	}

	const query: CommunityPostsQuery = {
		parent: req.postId,
		removed: false,
		app_data: { $ne: null },
		message_to_pid: { $eq: null }
	};

	const limit = req.limit ?? 10;
	const offset = req.offset ?? 0;

	if (req.afterDate || req.beforeDate) {
		query.created_at = {
			$gte: req.afterDate,
			$lte: req.beforeDate
		};
	}

	const posts: HydratedPostDocument[] = await Post.find(query).sort({ created_at: -1 }).skip(offset).limit(limit);

	const postsList: PostData[] = [];

	for (const post of posts) {
		postsList.push(post.proto({
			app_data: true,
			with_mii: true
		}));
	}

	return {
		posts: postsList
	};
}
