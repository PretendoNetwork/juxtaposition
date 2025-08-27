import { getCommunityHash, getUserHash } from '@/util';
import type { Response } from 'express';
import type HashMap from 'hashmap';

export type RenderContext = {
	lang: Record<string, any>;
	cdnUrl: string;
	moderator: boolean;
	pid: number;
	usersMap: HashMap<number, string>; // map of PID -> screen name

	// map of the following:
	//  olive_community_id -> community name
	//  title_id -> community name
	//  <TITLE_ID>-id -> olive_community_id
	communityMap: HashMap<string, string>;
};

export function buildContext(res: Response): RenderContext {
	const locals = res.locals;
	return {
		usersMap: getUserHash(),
		communityMap: getCommunityHash(),
		lang: locals.lang,
		cdnUrl: locals.cdnURL,
		moderator: locals.moderator,
		pid: locals.pid
	};
}
