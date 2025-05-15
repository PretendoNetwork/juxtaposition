import express from 'express';
import { testRouter } from '@/services/internal/routes/test';

export const internalApiRouter = express.Router();
internalApiRouter.use('/api/v1', testRouter);
