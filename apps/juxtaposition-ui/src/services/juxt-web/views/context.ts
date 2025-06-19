import { getUserHash } from '@/util';
import type { Response } from 'express';
import type HashMap from 'hashmap';

export type RenderContext = {
	lang: Record<string, any>;
	cdnUrl: string;
	moderator: boolean;
	pid: number;
	usersMap: HashMap<number, string>; // map of PID -> screen name
};

export function buildContext(res: Response): RenderContext {
	const locals = res.locals;
	return {
		usersMap: getUserHash(),
		lang: locals.lang,
		cdnUrl: locals.cdnURL,
		moderator: locals.moderator,
		pid: locals.pid
	};
}
