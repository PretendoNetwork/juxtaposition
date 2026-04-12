import express from 'express';
import { postsRouter } from '@/services/internal/routes/posts';
import { communitiesRouter } from '@/services/internal/routes/communities';
import { activityFeedsRouter } from '@/services/internal/routes/activityFeeds';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', postsRouter.toRouter());
internalApiRouter.use('/api/v1', communitiesRouter.toRouter());
internalApiRouter.use('/api/v1', activityFeedsRouter.toRouter());
