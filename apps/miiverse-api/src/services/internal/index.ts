import express from 'express';
import { testRouter } from '@/services/internal/routes/test';

const router = express.Router();
router.use('/api/v1', testRouter);

export const internalApiRouter = express.Router();
internalApiRouter.use(router);
