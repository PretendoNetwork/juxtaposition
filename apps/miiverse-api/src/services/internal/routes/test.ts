import express from 'express';
import { handle } from '@/services/internal/utils';

export const testRouter = express.Router();

testRouter.get('/test', handle(async () => {
	return {
		message: 'Hello from the test route!'
	};
}));
