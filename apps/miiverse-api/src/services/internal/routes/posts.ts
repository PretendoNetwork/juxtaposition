import * as z from 'zod';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { mapPage, pageDtoSchema } from '@/services/internal/contract/page';
import { pageSchema } from '@/services/internal/pagination';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { empathySchema, mapEmpathy } from '@/services/internal/contract/empathy';
import { postIdObjSchema, postIdSchema } from '@/services/internal/schemas';
import { createInternalApiRouter } from '@/services/internal/builder/router';

export const postsRouter = createInternalApiRouter();

// Get posts by topic tag, poster, or empathy
postsRouter.get({
	path: '/posts',
	guard: guards.guest,
	schema: {
		query: z.object({
			topic_tag: z.string().optional(),
			posted_by: z.coerce.number().optional(),
			empathy_by: z.coerce.number().optional(),
			parent_id: postIdSchema.optional(),
			include_replies: z.stringbool().default(false),
			sort: z.enum(['newest', 'oldest']).default('newest')
			// Increased page limit for replies
		}).and(pageSchema(500)),
		response: pageDtoSchema(postSchema)
	},
	async handler({ query, auth }) {
		if (query.parent_id && !query.include_replies) {
			throw new errors.badRequest('Please set include_replies=true to get replies to a parent');
		}
		// guests can view userpages, but not feeds (no topic tags etc.)
		if (auth === null && !query.posted_by && !query.empathy_by && !query.parent_id) {
			throw new errors.unauthorized('Authentication token not provided');
		}

		const sortOrder = query.sort === 'newest' ? -1 : 1;
		const posts = await Post.find(deleteOptional({
			pid: query.posted_by,
			topic_tag: query.topic_tag,
			yeahs: query.empathy_by,
			parent: query.parent_id,

			message_to_pid: null, // messages aren't really posts
			...query.include_replies ? {} : { parent: null },
			...filterRemovedPosts(auth)
		})).sort({ created_at: sortOrder }).skip(query.offset).limit(query.limit);

		return mapPage(posts.map(mapPost));
	}
});

// Get post by id
postsRouter.get({
	path: '/posts/:post_id',
	guard: guards.guest,
	schema: {
		params: postIdObjSchema,
		response: postSchema
	},
	async handler({ params, auth }) {
		const post = await Post.findOne({
			id: params.post_id,
			message_to_pid: null, // messages aren't really posts
			...filterRemovedPosts(auth)
		});
		if (!post) {
			throw new errors.notFound('Post not found');
		}

		return mapPost(post);
	}
});

// Delete post by id
postsRouter.delete({
	path: '/posts/:post_id',
	guard: guards.user,
	schema: {
		params: postIdObjSchema,
		query: z.object({
			// Reason is only for moderators
			reason: z.string().optional()
		}),
		response: resultSchema
	},
	async handler({ query, params, auth }) {
		const post = await Post.findOne({
			id: params.post_id,
			message_to_pid: null, // messages aren't really posts
			...filterRemovedPosts(auth)
		});
		if (!post) {
			throw new errors.notFound('Post not found');
		}

		// guards.user makes this safe
		const account = auth!;

		let reason = 'User requested removal';
		if (post.pid !== account.pnid.pid) {
			if (account.moderator) {
			// If a moderator deletes someone else's post, they can provide a reason
				reason = query.reason ?? 'Removed by moderator';
			} else {
			// Non-moderators can't delete other posts
				throw new errors.forbidden('Not allowed');
			}
		}

		await post.del(reason, account.pnid.pid);

		if (post.parent) {
			await Post.findOneAndUpdate({
				id: post.parent
			}, {
				$inc: { reply_count: -1 }
			});
		}

		return mapResult('success');
	}
});

// Add or remove empathy
postsRouter.post({
	path: '/posts/:post_id/empathies',
	guard: guards.user,
	schema: {
		params: postIdObjSchema,
		body: z.object({
			action: z.literal(['add', 'remove'])
		}),
		response: empathySchema
	},
	async handler({ body, params, auth }) {
		let post = await Post.findOne({
			id: params.post_id,
			message_to_pid: null, // messages aren't really posts
			...filterRemovedPosts(auth)
		});
		if (!post) {
			throw new errors.notFound('Post not found');
		}

		// guards.user makes this safe
		const account = auth!;
		const pid = account.pnid.pid;

		if (body.action === 'add') {
		/* We have to re-query here rather than use updateOne to ensure idempotence on empathy_count
		 * If we ever used yeahs.length we could stop bothering with this */
			post = await Post.findOneAndUpdate({
				_id: post._id,
				yeahs: { $ne: pid }
			}, {
				$addToSet: { yeahs: pid },
				$inc: { empathy_count: 1 }
			}, { new: true });
		} else {
			post = await Post.findOneAndUpdate({
				_id: post._id,
				yeahs: pid
			}, {
				$pull: { yeahs: pid },
				$inc: { empathy_count: -1 }
			}, { new: true });
		}
		if (!post) {
			throw new errors.notFound('Post not found');
		}

		return mapEmpathy(body.action, post);
	}
});
