import express from 'express';
import { postsRouter } from '@/services/internal/routes/posts';
import { communitiesRouter } from '@/services/internal/routes/communities';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', postsRouter.toRouter());
internalApiRouter.use('/api/v1', communitiesRouter.toRouter());
