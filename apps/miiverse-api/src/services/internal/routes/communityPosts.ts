import { z } from 'zod';
import { Post } from '@/models/post';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, mapPostWithModeration, postSchema } from '@/services/internal/contract/post';
import { feedPageDtoSchema, mapFeedPage, pageControlSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { Community } from '@/models/community';
import { createNewPost, postCreateSchema } from '@/services/internal/utils/posts';
import { errors } from '@/services/internal/errors';
import { isPostingAllowed } from '@/services/internal/utils/communities';
import { mapSelf } from '@/services/internal/contract/self';
import { Settings } from '@/models/settings';

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
				message_to_pid: null, // messages aren't really posts
				...filterRemovedPosts(auth)
			}))
			.sort({ created_at: -1 })
			.skip(query.offset)
			.limit(query.limit);

		const communityIds = posts.map(v => v.community_id);
		const communities = await Community.find({ olive_community_id: { $in: communityIds } });

		const userIds = posts.flatMap(v => v.removed_by).filter(v => !!v);
		const users = await Settings.find({ pid: { $in: userIds } });

		const mappedPosts = posts.map((p) => {
			const comm = communities.find(v => v.olive_community_id === p.community_id) ?? null;
			const remover = p.removed_by ? users.find(v => v.pid === p.removed_by) ?? null : null;

			if (auth?.moderator) {
				return mapPostWithModeration(p, comm, remover);
			}
			return mapPost(p, comm);
		});
		return mapFeedPage(mappedPosts);
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

		const userIds = posts.flatMap(v => v.removed_by).filter(v => !!v);
		const users = await Settings.find({ pid: { $in: userIds } });

		const mappedPosts = posts.map((p) => {
			const comm = communities.find(v => v.olive_community_id === p.community_id) ?? null;
			const remover = p.removed_by ? users.find(v => v.pid === p.removed_by) ?? null : null;

			if (auth?.moderator) {
				return mapPostWithModeration(p, comm, remover);
			}
			return mapPost(p, comm);
		});
		return mapFeedPage(mappedPosts);
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
