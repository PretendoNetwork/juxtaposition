import { PostType, SortBy } from '@pretendonetwork/grpc/miiverse/v2/post';
import { Post } from '@/models/post';
import type { PostData } from '@pretendonetwork/grpc/miiverse/v2/post';
import type { GetUserPostsRequest, GetUserPostsResponse } from '@pretendonetwork/grpc/miiverse/v2/get_user_posts_rpc';
import type { CommunityPostsQuery } from '@/types/mongoose/community-posts-query';
import type { HydratedPostDocument } from '@/types/mongoose/post';

type PostSortOrder = { empathy_count: -1 } | { created_at: -1 };

export async function getUserPosts(req: GetUserPostsRequest): Promise<GetUserPostsResponse> {
	const query: CommunityPostsQuery = {
		pid: req.pid,
		removed: false,
		app_data: { $ne: null },
		message_to_pid: { $eq: null }
	};

	const limit = req.limit ?? 10;
	const offset = req.offset ?? 0;

	if (req.searchKey) {
		query.search_key = req.searchKey;
	}

	if (!req.allowSpoiler) {
		query.is_spoiler = 0;
	}

	if (req.afterDate || req.beforeDate) {
		query.created_at = {
			$gte: req.afterDate,
			$lte: req.beforeDate
		};
	}

	switch (req.type) {
		case PostType.POST_TYPE_TEXT:
			query.body = { $nin: [null, ''] };
			break;
		case PostType.POST_TYPE_MEMO:
			query.painting = { $nin: [null, ''] };
			break;
		case PostType.POST_TYPE_SCREENSHOT:
			query.screenshot = { $nin: [null, ''] };
			break;
	}

	const postSortOrder: PostSortOrder = req.sortBy == SortBy.SORT_BY_POPULAR ? { empathy_count: -1 } : { created_at: -1 };

	const posts: HydratedPostDocument[] = await Post.find(query).sort(postSortOrder).skip(offset).limit(limit);

	const postsList: PostData[] = [];

	for (const post of posts) {
		postsList.push(post.proto({
			app_data: true,
			with_mii: req.withMii
		}));
	}

	return {
		posts: postsList
	};
}
