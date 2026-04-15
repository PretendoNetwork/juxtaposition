import express from 'express';
import { postsRouter } from '@/services/internal/routes/posts';
import { communitiesRouter } from '@/services/internal/routes/communities';
import { activityFeedsRouter } from '@/services/internal/routes/activityFeeds';
import { communityPostsRouter } from '@/services/internal/routes/communityPosts';
import { userPostsRouter } from '@/services/internal/routes/userPosts';
import { userProfileRouter } from '@/services/internal/routes/userProfile';
import { selfRouter } from '@/services/internal/routes/self';
import { adminCommunitiesRouter } from '@/services/internal/routes/admin/adminCommunities';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', postsRouter.toRouter());
internalApiRouter.use('/api/v1', communitiesRouter.toRouter());
internalApiRouter.use('/api/v1', activityFeedsRouter.toRouter());
internalApiRouter.use('/api/v1', communityPostsRouter.toRouter());
internalApiRouter.use('/api/v1', userPostsRouter.toRouter());
internalApiRouter.use('/api/v1', userProfileRouter.toRouter());
internalApiRouter.use('/api/v1', selfRouter.toRouter());
internalApiRouter.use('/api/v1', adminCommunitiesRouter.toRouter());
