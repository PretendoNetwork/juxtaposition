import express from 'express';
import { postsRouter } from '@/services/internal/routes/posts';
import { communitiesRouter } from '@/services/internal/routes/communities';
import { activityFeedsRouter } from '@/services/internal/routes/activityFeeds';
import { communityPostsRouter } from '@/services/internal/routes/communityPosts';
import { adminAutomodRouter } from '@/services/internal/routes/admin/adminAutomod';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', postsRouter.toRouter());
internalApiRouter.use('/api/v1', communitiesRouter.toRouter());
internalApiRouter.use('/api/v1', activityFeedsRouter.toRouter());
internalApiRouter.use('/api/v1', communityPostsRouter.toRouter());
internalApiRouter.use('/api/v1', adminAutomodRouter.toRouter());
