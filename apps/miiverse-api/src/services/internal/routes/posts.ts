import express from 'express';
import * as z from 'zod/v4';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { deleteOptional, filterRemovedPosts, handle } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost } from '@/services/internal/contract/post';
import { mapPages } from '@/services/internal/contract/page';
import { pageSchema } from '@/services/internal/pagination';
import { mapResult } from '@/services/internal/contract/result';

export const postsRouter = express.Router();

// Get posts by topic tag, poster, or empathy
postsRouter.get('/posts', guards.user, handle(async ({ req, res }) => {
	// the idea is that any combination of these can be left undefined
	const query = z.object({
		topic_tag: z.string().optional(),
		posted_by: z.coerce.number().optional(),
		empathy_by: z.coerce.number().optional(),
		parent_id: z.string().length(21).optional(),
		include_replies: z.stringbool().default(false)
	}).and(pageSchema()).parse(req.query);

	if (query.parent_id && !query.include_replies) {
		throw new errors.badRequest('Please set include_replies=true to get replies to a parent');
	}

	const posts = await Post.find(deleteOptional({
		pid: query.posted_by,
		topic_tag: query.topic_tag,
		yeahs: query.empathy_by,
		parent: query.parent_id,

		message_to_pid: null, // messages aren't really posts
		...query.include_replies ? {} : { parent: null },
		...filterRemovedPosts(res.locals.account)
	})).sort({ created_at: -1 }).skip(query.offset).limit(query.limit);

	// PageDto<PostDto>
	return mapPages(posts.map(mapPost));
}));

// Get post by id
postsRouter.get('/posts/:post_id', guards.guest, handle(async ({ req, res }) => {
	const params = z.object({
		post_id: z.string().length(21)
	}).parse(req.params);

	const post = await Post.findOne({
		id: params.post_id,
		...filterRemovedPosts(res.locals.account)
	});
	if (!post) {
		throw new errors.notFound('Post not found');
	}

	// PostDto
	return mapPost(post);
}));

// Delete post by id
postsRouter.delete('/posts/:post_id', guards.user, handle(async ({ req, res }) => {
	const params = z.object({
		post_id: z.string().length(21)
	}).parse(req.params);

	const query = z.object({
		// Reason is only for moderators
		reason: z.string().optional()
	}).parse(req.query);

	const post = await Post.findOne({
		id: params.post_id,
		...filterRemovedPosts(res.locals.account)
	});
	if (!post) {
		throw new errors.notFound('Post not found');
	}

	// guards.user makes this safe
	const account = res.locals.account!;

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

	post.del(reason, account.pnid.pid);

	// ResultDto
	return mapResult('success');
}));
