import { z } from 'zod';
import { Post } from '@/models/post';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, mapPostWithModeration, postSchema } from '@/services/internal/contract/post';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { canAccessUser } from '@/services/internal/utils/user';
import { getPostTypeFilter, postTypeFilter, standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { Settings } from '@/models/settings';
import { Community } from '@/models/community';
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
			type: postTypeFilter.default('post'),
			sort: standardSortSchema,
			sortBy: z.enum(['createdAt', 'removedAt']).default('createdAt')
		}).extend(pageControlSchema()),
		response: pageDtoSchema(postSchema)
	},
	async handler({ params, query, auth }) {
		const pid = params.id;
		const user = await Settings.findOne({ pid });
		// We can't see this user for some reason (doesn't exist, permission, etc)
		if (!user || !canAccessUser(auth, user)) {
			return mapPage(0, []);
		}

		const dbQuery: FilterQuery<IPost> = deleteOptional({
			pid,
			removed: query.removed,
			message_to_pid: null, // messages aren't really posts
			...getPostTypeFilter(query.type),
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
		return mapPage(total, mappedPosts);
	}
});
