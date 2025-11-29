import type { AccountData } from '@/types/common/account-data';
import type { Request, Response } from 'express';

export type HandlerContext = {
	req: Request;
	res: Response;
};

export type HandlerFunction = (ctx: HandlerContext) => any;

export function handle(handler: HandlerFunction) {
	return async (req: Request, res: Response): Promise<void> => {
		const ctx: HandlerContext = { req, res };
		const result = await handler(ctx);
		res.status(200).json(result);
	};
}

/**
 * Returns { removed: false }, unless you're a moderator.
 * The idea is that you can object spread this into a query. Now moderators can see
 * removed posts.
 * @param account The account making the request.
 * @returns The appropriate filter
 */
export function filterRemovedPosts(account: AccountData | null): { removed?: false } {
	return account?.moderator ? {} : { removed: false };
}

/**
 * Deletes undefined, but present, values. Useful for Mongoose queries.
 * @param obj Your object.
 * @returns Partial<obj>, with undefined values deleted
 */
export function deleteOptional<T extends {}>(obj: T): Partial<T> { // Partial<T> kinda wrong but good enough
	for (const _key of Object.keys(obj)) {
		const key = _key as keyof T;
		if (obj[key] === undefined) {
			delete obj[key];
		}
	}
	return obj;
}
