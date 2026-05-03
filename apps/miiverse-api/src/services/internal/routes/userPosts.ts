import { z } from 'zod';
import { Post } from '@/models/post';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { Settings } from '@/models/settings';
import type { FilterQuery } from 'mongoose';
import type { IPost } from '@/types/mongoose/post';

export const userPostsRouter = createInternalApiRouter();

userPostsRouter.get({
	path: '/users/:id/posts',
	name: 'users.posts.list',
	guard: guards.guest,
	schema: {
		params: z.object({
			id: z.coerce.number()
		}),
		query: z.object({
			removed: z.stringbool().optional(),
			sort: standardSortSchema,
			sortBy: z.enum(['createdAt', 'removedAt']).default('createdAt')
		}).extend(pageControlSchema()),
		response: pageDtoSchema(postSchema)
	},
	async handler({ params, query, auth }) {
		const targetUser = await Settings.findOne({ pid: params.id });
		if (!targetUser) {
			return mapPage(0, []);
		}

		const dbQuery: FilterQuery<IPost> = deleteOptional({
			pid: targetUser.pid,
			removed: query.removed,
			parent: null,
			message_to_pid: null, // messages aren't really posts
			...filterRemovedPosts(auth)
		});
		const sortKey: keyof IPost = query.sortBy === 'removedAt' ? 'removed_at' : 'created_at';
		const posts = await Post
			.find(dbQuery)
			.sort({
				[sortKey]: standardSortToDirection(query.sort)
			})
			.skip(query.offset)
			.limit(query.limit);
		const total = await Post.countDocuments(dbQuery);

		return mapPage(total, posts.map(mapPost));
	}
});
