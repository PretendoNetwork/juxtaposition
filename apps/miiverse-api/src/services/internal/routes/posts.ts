import express from 'express';
import { getPostByID } from '@/database';
import { errors } from '@/services/internal/errors';
import { handle } from '@/services/internal/utils';
import { authGuest } from '@/services/internal/middleware/authenticated-endpoints';
import { mapPost } from '@/services/internal/contract/post';

export const postsRouter = express.Router();

postsRouter.get('/:post_id', authGuest, handle(async ({ req }) => {
	const post = await getPostByID(req.params.post_id);
	if (!post || post.removed) {
		throw new errors.notFound('Post not found');
	}

	return mapPost(post);
}));
