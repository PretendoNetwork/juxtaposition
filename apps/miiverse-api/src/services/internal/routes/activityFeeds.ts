import { z } from 'zod';
import { Post } from '@/models/post';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { feedPageDtoSchema, mapFeedPage, pageControlSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import type { FilterQuery } from 'mongoose';
import type { IPost } from '@/types/mongoose/post';

export const activityFeedsRouter = createInternalApiRouter();

activityFeedsRouter.get({
	path: '/activity-feed/fresh',
	name: 'activityFeed.getFresh',
	description: 'Get posts from the fresh feed (global newest posts)',
	guard: guards.user,
	schema: {
		query: z.object(pageControlSchema(500)),
		response: feedPageDtoSchema(postSchema)
	},
	async handler({ query, auth }) {
		const posts = await Post
			.find(deleteOptional({
				parent: null,
				message_to_pid: null,
				...filterRemovedPosts(auth)
			}))
			.sort({ created_at: -1 })
			.skip(query.offset)
			.limit(query.limit);

		return mapFeedPage(posts.map(mapPost));
	}
});

activityFeedsRouter.get({
	path: '/activity-feed/people',
	name: 'activityFeed.getPeople',
	description: 'Get posts from the people feed (newest posts from followed users)',
	guard: guards.user,
	schema: {
		query: z.object(pageControlSchema(500)),
		response: feedPageDtoSchema(postSchema)
	},
	async handler({ query, auth }) {
		const { content, pnid } = auth!; // Auth guard protects it

		const anyOfQueries: FilterQuery<IPost>[] = [
			{ pid: pnid.pid } // Add own posts
		];
		if (content) {
			anyOfQueries.push({ pid: content.followed_users }); // Add following users posts
		}

		const posts = await Post
			.find(deleteOptional({
				$or: anyOfQueries,
				parent: null,
				message_to_pid: null,
				...filterRemovedPosts(auth)
			}))
			.sort({ created_at: -1 })
			.skip(query.offset)
			.limit(query.limit);

		return mapFeedPage(posts.map(mapPost));
	}
});

activityFeedsRouter.get({
	path: '/activity-feed/following',
	name: 'activityFeed.getFollowing',
	description: 'Get posts from the following feed (newest posts from followed users and communities)',
	guard: guards.user,
	schema: {
		query: z.object(pageControlSchema(500)),
		response: feedPageDtoSchema(postSchema)
	},
	async handler({ query, auth }) {
		const { content, pnid } = auth!; // Auth guard protects it

		const anyOfQueries: FilterQuery<IPost>[] = [
			{ pid: pnid.pid } // Add own posts
		];
		if (content) {
			anyOfQueries.push({ pid: content.followed_users }); // Add following users posts
			anyOfQueries.push({ community_id: content.followed_communities }); // Add following communities posts
		}

		const posts = await Post
			.find(deleteOptional({
				$or: anyOfQueries,
				parent: null,
				message_to_pid: null,
				...filterRemovedPosts(auth)
			}))
			.sort({ created_at: -1 })
			.skip(query.offset)
			.limit(query.limit);

		return mapFeedPage(posts.map(mapPost));
	}
});
