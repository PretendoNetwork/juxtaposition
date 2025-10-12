import express from 'express';
import { testRouter } from '@/services/internal/routes/test';
import { postsRouter } from '@/services/internal/routes/posts';
import { usersRouter } from '@/services/internal/routes/users';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', testRouter);
internalApiRouter.use('/api/v1', postsRouter);
internalApiRouter.use('/api/v1', usersRouter);
