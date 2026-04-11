import express from 'express';
import { postsRouter } from '@/services/internal/routes/posts';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', postsRouter);
