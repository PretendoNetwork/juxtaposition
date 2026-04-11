import { createInternalApiClient } from '@/api/client';
import type { RequestHandler } from 'express';

export const internalApiMiddleware: RequestHandler = async (req, res, next) => {
	req.api = createInternalApiClient(req.tokens);

	next();
};
