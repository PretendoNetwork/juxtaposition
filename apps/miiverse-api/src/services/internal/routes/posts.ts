import express from 'express';
import * as z from 'zod/v4';
import { Post } from '@/models/post';
import { errors } from '@/services/internal/errors';
import { deleteOptional, filterRemovedPosts, handle } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost } from '@/services/internal/contract/post';

export const postsRouter = express.Router();

// Get posts by topic tag, poster, or empathy
// TODO paging
postsRouter.get('/posts', guards.user, handle(async ({ req, res }) => {
	// the idea is that any combination of these can be left undefined
	const query = z.object({
		topic_tag: z.string().optional(),
		posted_by: z.coerce.number().optional(),
		empathy_by: z.coerce.number().optional(),
		offset: z.coerce.number().default(0)
	}).parse(req.query);

	const posts = await Post.find(deleteOptional({
		message_to_pid: null, // messages aren't really posts
		pid: query.posted_by,
		topic_tag: query.topic_tag,
		yeahs: query.empathy_by,
		...filterRemovedPosts(res.locals.account)
	})).sort({ created_at: -1 }).skip(query.offset).limit(10); // TODO configure postLimit?

	// PostDto[]
	return posts.map(mapPost);
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
