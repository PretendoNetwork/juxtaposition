import { logger } from '@/logger';
import type { Request, Response } from 'express';

export type HandlerContext = {
	req: Request;
	res: Response;
};

export type HandlerFunction = (ctx: HandlerContext) => any;

export function handle(handler: HandlerFunction) {
	return async (req: Request, res: Response): Promise<void> => {
		try {
			const ctx: HandlerContext = { req, res };
			const result = await handler(ctx);
			res.status(200).json(result);
			return;
		} catch (error) {
			logger.error(error, 'Unhandled exception in handler');
			res.status(500).json({ error: 'Internal Server Error' });
			return;
		}
	};
}
