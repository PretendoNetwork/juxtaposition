import { ServerError, Status } from 'nice-grpc';
import { PostType, SortBy } from '@pretendonetwork/grpc/miiverse/v2/post';
import { Community } from '@/models/community';
import { Post } from '@/models/post';
import type { PostData } from '@pretendonetwork/grpc/miiverse/v2/post';
import type { GetCommunityPostsRequest, GetCommunityPostsResponse } from '@pretendonetwork/grpc/miiverse/v2/get_community_posts_rpc';
import type { CommunityPostsQuery } from '@/types/mongoose/community-posts-query';
import type { HydratedPostDocument, IPost } from '@/types/mongoose/post';

type PostSortOrder = { empathy_count: -1 } | { created_at: -1 };

export async function getCommunityPosts(req: GetCommunityPostsRequest): Promise<GetCommunityPostsResponse> {
	const community = await Community.findOne({
		community_id: req.communityId
	});

	if (!community) {
		throw new ServerError(Status.NOT_FOUND, `Community with ID ${req.communityId} was not found`);
	}

	const query: CommunityPostsQuery = {
		community_id: community.olive_community_id,
		removed: false,
		app_data: { $ne: null },
		message_to_pid: { $eq: null }
	};

	// const queryBy = req.queryBy;
	const limit = req.limit ?? 10;
	const offset = req.offset ?? 0;

	// TODO: I was under the impression that we could have multiple search keys, may need to refactor this
	if (req.searchKey) {
		query.search_key = req.searchKey[0];
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

	// TODO: Realized only now that there is have no concept of "self" for grpc requests. Maybe need to add a pid field for these queries?
	/* switch (queryBy) {
		case QueryType.QUERY_TYPE_FOLLOWINGS:
			query.pid = await getFollowedUserPids(request.pid);
			break;
		case QueryType.QUERY_TYPE_SELF:
			query.pid = req.pid;
			break;
	} */
	const postSortOrder: PostSortOrder = req.sortBy == SortBy.SORT_BY_POPULAR ? { empathy_count: -1 } : { created_at: -1 };

	let posts: HydratedPostDocument[];

	if (req.distinctPid) {
		const unhydratedPosts = await Post.aggregate<IPost>([
			{ $match: query }, // filter based on input query
			{ $sort: postSortOrder },
			{ $group: { _id: '$pid', doc: { $first: '$$ROOT' } } }, // remove any duplicate 'pid' elements
			{ $replaceRoot: { newRoot: '$doc' } }, // replace the root with the 'doc' field
			{ $skip: offset },
			{ $limit: limit }
		]);
		posts = unhydratedPosts.map((post: IPost) => Post.hydrate(post));
	} else {
		posts = await Post.find(query).sort(postSortOrder).skip(offset).limit(limit);
	}

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
