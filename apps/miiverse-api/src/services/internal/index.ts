import express from 'express';
import { testRouter } from '@/services/internal/routes/test';
import { postsRouter } from '@/services/internal/routes/posts';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', testRouter);
internalApiRouter.use('/api/v1', postsRouter);
