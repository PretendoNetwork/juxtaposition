import { getUserHash } from '@/util';
import type { Response } from 'express';
import type HashMap from 'hashmap';

export type RenderContext = {
	lang: Record<string, any>;
	cdnUrl: string;
	moderator: boolean;
	pid: number;
	uaIsConsole?: boolean; // user agent looks like a Nintendo console
	usersMap: HashMap<number, string>; // map of PID -> screen name
};

export function buildContext(res: Response): RenderContext {
	const locals = res.locals;
	return {
		usersMap: getUserHash(),
		lang: locals.lang,
		cdnUrl: locals.cdnURL,
		moderator: locals.moderator,
		uaIsConsole: locals.uaIsConsole,
		pid: locals.pid
	};
}
