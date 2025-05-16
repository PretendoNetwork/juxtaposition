import express from 'express';
import { getPostByID } from '@/database';
import { errors } from '@/services/internal/errors';
import { handle } from '@/services/internal/utils';

export const postsRouter = express.Router();

postsRouter.get('/:post_id', handle(async ({ req }) => {
	const post = await getPostByID(req.params.post_id);
	if (!post || post.removed) {
		throw new errors.notFound('Post not found');
	}

	return post;
}));
