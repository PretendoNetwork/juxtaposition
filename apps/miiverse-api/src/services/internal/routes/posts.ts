import { z } from 'zod';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { deleteOptional, filterRemovedPosts } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost, postSchema } from '@/services/internal/contract/post';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { empathyActionSchema, empathySchema, mapEmpathy } from '@/services/internal/contract/empathy';
import { postIdObjSchema, postIdSchema } from '@/services/internal/schemas';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { createLogEntry } from '@/services/internal/utils/auditLogs';
import { Community } from '@/models/community';
import { Report } from '@/models/report';
import { createNewPost, postCreateSchema } from '@/services/internal/utils/posts';
import { isPostingAllowed } from '@/services/internal/utils/communities';
import { mapSelf } from '@/services/internal/contract/self';
import type { FilterQuery } from 'mongoose';
import type { IPost } from '@/types/mongoose/post';

export const postsRouter = createInternalApiRouter();

postsRouter.get({
	path: '/posts',
	name: 'posts.list',
	description: 'Get posts by topic tag, poster, or empathy',
	guard: guards.guest,
	schema: {
		query: z.object({
			topic_tag: z.string().optional(),
			posted_by: z.coerce.number().optional(),
			empathy_by: z.coerce.number().optional(),
			parent_id: postIdSchema.optional(),
			include_replies: z.stringbool().default(false),
			sort: standardSortSchema
			// Increased page limit for replies
		}).extend(pageControlSchema(500)),
		response: pageDtoSchema(postSchema)
	},
	async handler({ query, auth }) {
		if (query.parent_id && !query.include_replies) {
			throw errors.for('bad_request', 'Please set include_replies=true to get replies to a parent');
		}
		// guests can view userpages, but not feeds (no topic tags etc.)
		if (auth === null && !query.posted_by && !query.empathy_by && !query.parent_id) {
			throw errors.for('requires_auth');
		}

		const dbQuery: FilterQuery<IPost> = deleteOptional({
			pid: query.posted_by,
			topic_tag: query.topic_tag,
			yeahs: query.empathy_by,
			parent: query.parent_id,

			message_to_pid: null, // messages aren't really posts
			...query.include_replies ? {} : { parent: null },
			...filterRemovedPosts(auth)
		});

		const posts = await Post
			.find(dbQuery)
			.sort({ created_at: standardSortToDirection(query.sort) })
			.skip(query.offset)
			.limit(query.limit);
		const total = await Post.countDocuments(dbQuery);

		const communityIds = posts.map(v => v.community_id);
		const communities = await Community.find({ olive_community_id: { $in: communityIds } });

		return mapPage(total, posts.map(p => mapPost(p, communities.find(v => v.olive_community_id === p.community_id) ?? null)));
	}
});

postsRouter.get({
	path: '/posts/:post_id',
	name: 'posts.get',
	guard: guards.guest,
	allowNotFound: true,
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
			throw errors.for('not_found');
		}
		const community = await Community.findOne({ olive_community_id: post.community_id });

		return mapPost(post, community);
	}
});

postsRouter.delete({
	path: '/posts/:post_id',
	name: 'posts.delete',
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
			throw errors.for('not_found');
		}

		// guards.user makes this safe
		const account = auth!;

		let reason = 'User requested removal';
		if (post.pid !== account.pnid.pid) {
			if (account.moderator) {
				// If a moderator deletes someone else's post, they can provide a reason
				reason = query.reason ?? 'Removed by moderator';
				await createLogEntry({
					actorId: account.pnid.pid,
					action: 'REMOVE_POST',
					targetResourceId: post.pid.toString(),
					context: `Post ${post.id} removed for: "${reason}"`
				});
			} else {
				// Non-moderators can't delete other posts
				throw errors.for('forbidden', 'Not your post');
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

postsRouter.post({
	path: '/posts/:post_id/empathies',
	name: 'posts.changeEmpathy',
	description: 'Add or remove empathy for current user',
	guard: guards.user,
	schema: {
		params: postIdObjSchema,
		body: z.object({
			action: empathyActionSchema
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
			throw errors.for('not_found');
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
			throw errors.for('not_found');
		}

		return mapEmpathy(body.action, post);
	}
});

postsRouter.post({
	path: '/posts/:post_id/report',
	name: 'posts.report',
	guard: guards.user,
	schema: {
		params: postIdObjSchema,
		body: z.object({
			reasonId: z.number(),
			message: z.string()
		}),
		response: resultSchema
	},
	async handler({ body, params, auth }) {
		// guards.user makes this safe
		const account = auth!;
		const pid = account.pnid.pid;

		const post = await Post.findOne({
			id: params.post_id,
			message_to_pid: null, // messages aren't really posts
			removed: false
		});
		if (!post) {
			throw new errors.notFound('Post not found');
		}

		const duplicateReport = await Report.findOne({
			reported_by: pid,
			post_id: post.id
		});
		if (duplicateReport) {
			return mapResult('success'); // Silently reject duplicate reports
		}

		await Report.create({
			pid: post.pid,
			reported_by: pid,
			post_id: post.id,
			reason: body.reasonId,
			message: body.message
		});

		return mapResult('success');
	}
});

postsRouter.post({
	path: '/posts/:post_id/replies',
	name: 'posts.reply',
	guard: guards.user,
	schema: {
		params: postIdObjSchema,
		body: postCreateSchema,
		response: postSchema
	},
	async handler({ body, params, auth }) {
		const account = auth!;

		const parentPost = await Post.findOne({
			id: params.post_id,
			message_to_pid: null,
			removed: false
		});
		if (!parentPost) {
			throw new errors.notFound('Community could not be found');
		}

		const community = await Community.findOne({ olive_community_id: parentPost.community_id });
		if (!community) {
			throw new errors.notFound('Community could not be found');
		}

		const self = mapSelf(account);
		if (!isPostingAllowed(community, self, parentPost)) {
			throw new errors.forbidden('You can not reply to this post');
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
			parentPost
		});

		return mapPost(newPost, community);
	}
});
