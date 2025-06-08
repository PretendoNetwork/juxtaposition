import express from 'express';
import { handle } from '@/services/internal/utils';
import { authUsers } from '@/services/internal/middleware/authenticated-endpoints';

export const testRouter = express.Router();

testRouter.get('/test', authUsers, handle(async () => {
	return {
		message: 'Hello from the test route!'
	};
}));
