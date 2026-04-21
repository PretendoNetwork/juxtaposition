import type { Request, Response } from 'express';

export type AuthContext = Response['locals']['account'];

export function buildAuthContext(req: Request, res: Response): AuthContext {
	return res.locals.account;
}
