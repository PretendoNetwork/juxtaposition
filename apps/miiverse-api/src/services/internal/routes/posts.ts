import express from 'express';
import { getPostByID } from '@/database';
import { errors } from '@/services/internal/errors';
import { handle } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPost } from '@/services/internal/contract/post';

export const postsRouter = express.Router();

postsRouter.get('/posts/:post_id', guards.guest, handle(async ({ req, res }) => {
	const post = await getPostByID(req.params.post_id);
	if (!post || (post.removed && res.locals.account?.moderator !== true)) {
		throw new errors.notFound('Post not found');
	}

	return mapPost(post);
}));
