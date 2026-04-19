import { z } from 'zod';
import { Post } from '@/models/post';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { feedPageDtoSchema, mapFeedPage, pageControlSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { Community } from '@/models/community';

export const communityPostsRouter = createInternalApiRouter();

communityPostsRouter.get({
	path: '/communities/:id/feed/fresh',
	name: 'communities.feed.getFresh',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.string()
		}),
		query: z.object(pageControlSchema()),
		response: feedPageDtoSchema(postSchema)
	},
	async handler({ params, query, auth }) {
		const posts = await Post
			.find(deleteOptional({
				community_id: params.id,
				parent: null,
				...filterRemovedPosts(auth)
			}))
			.sort({ created_at: -1 })
			.skip(query.offset)
			.limit(query.limit);

		const communityIds = posts.map(v => v.community_id);
		const communities = await Community.find({ olive_community_id: { $in: communityIds } });

		return mapFeedPage(posts.map(p => mapPost(p, communities.find(v => v.olive_community_id === p.community_id) ?? null)));
	}
});

communityPostsRouter.get({
	path: '/communities/:id/feed/popular',
	name: 'communities.feed.getPopular',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.string()
		}),
		query: z.object(pageControlSchema()),
		response: feedPageDtoSchema(postSchema)
	},
	async handler({ params, query, auth }) {
		const posts = await Post
			.find(deleteOptional({
				community_id: params.id,
				parent: null,
				...filterRemovedPosts(auth)
			}))
			.sort({ empathy_count: -1 })
			.skip(query.offset)
			.limit(query.limit);

		const communityIds = posts.map(v => v.community_id);
		const communities = await Community.find({ olive_community_id: { $in: communityIds } });

		return mapFeedPage(posts.map(p => mapPost(p, communities.find(v => v.olive_community_id === p.community_id) ?? null)));
	}
});
