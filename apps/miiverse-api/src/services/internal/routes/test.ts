import express from 'express';
import { handle } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';

export const testRouter = express.Router();

testRouter.get('/test', guards.user, handle(async () => {
	return {
		message: 'Hello from the test route!'
	};
}));
