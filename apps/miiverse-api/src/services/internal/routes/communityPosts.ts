import { z } from 'zod';
import { Post } from '@/models/post';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { feedPageDtoSchema, mapFeedPage, pageControlSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { Community } from '@/models/community';
import { createNewPost, postCreateSchema } from '@/services/internal/utils/posts';
import { errors } from '@/services/internal/errors';
import { isPostingAllowed } from '@/services/internal/utils/communities';
import { mapSelf } from '@/services/internal/contract/self';

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

communityPostsRouter.post({
	path: '/communities/:id/posts',
	name: 'communities.createPost',
	guard: guards.user,
	schema: {
		params: z.object({
			id: z.string()
		}),
		body: postCreateSchema,
		response: postSchema
	},
	async handler({ body, params, auth }) {
		const account = auth!;

		const community = await Community.findOne({ olive_community_id: params.id });
		if (!community) {
			throw errors.for('not_found');
		}

		const self = mapSelf(account);
		if (!isPostingAllowed(community, self, null)) {
			throw errors.for('forbidden');
		}

		const newPost = await createNewPost({
			author: {
				pid: account.pnid.pid,
				miiData: account.pnid.mii?.data ?? '',
				screenName: account.settings?.screen_name ?? '',
				verified: self.permissions.moderator
			},
			body,
			community,
			parentPost: null
		});

		return mapPost(newPost, community);
	}
});
