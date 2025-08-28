import express from 'express';
import { z } from 'zod';
import { database } from '@/database';
import { getCommunityHash } from '@/util';
import { POST } from '@/models/post';
import { config } from '@/config';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebGlobalFeedView, WebPersonalFeedView } from '@/services/juxt-web/views/web/feed';
import { buildContext } from '@/services/juxt-web/views/context';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { CtrGlobalFeedView, CtrPersonalFeedView } from '@/services/juxt-web/views/ctr/feed';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';

export const feedRouter = express.Router();

feedRouter.get('/', async function (req, res) {
	const { auth, query } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional()
		})
	});
	const userContent = await database.getUserContent(auth().pid);
	const communityMap = getCommunityHash();
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await database.getNewsFeed(userContent, config.postLimit);

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		nextLink: `/feed/more?offset=${posts.length}&pjax=true`
	};

	if (query.pjax) {
		// TODO port ctr and portal
		return res.jsxForDirectory({
			web: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
			portal: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
			ctr: <CtrPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />
		});
	}

	// TODO port ctr and portal
	const title = res.locals.lang.global.activity_feed;
	return res.jsxForDirectory({
		web: <WebPersonalFeedView ctx={buildContext(res)} title={title} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		portal: <WebPersonalFeedView ctx={buildContext(res)} title={title} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		ctr: <CtrPersonalFeedView ctx={buildContext(res)} title={title} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />
	});
});

feedRouter.get('/all', async function (req, res) {
	const { auth, query } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional()
		})
	});
	const userContent = await database.getUserContent(auth().pid);
	const communityMap = getCommunityHash();
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await POST.find({
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(config.postLimit).sort({ created_at: -1 });

	const bundle = {
		posts,
		open: true,
		communityMap,
		userContent,
		nextLink: `/feed/all/more?offset=${posts.length}&pjax=true`
	};

	if (query.pjax) {
		// TODO port ctr and portal
		return res.jsxForDirectory({
			web: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
			portal: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
			ctr: <CtrPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />
		});
	}

	// TODO port ctr and portal
	const title = res.locals.lang.global.activity_feed;
	return res.jsxForDirectory({
		web: <WebGlobalFeedView ctx={buildContext(res)} title={title} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		portal: <WebGlobalFeedView ctx={buildContext(res)} title={title} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		ctr: <CtrGlobalFeedView ctx={buildContext(res)} title={title} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />
	});
});

feedRouter.get('/more', async function (req, res) {
	const { auth, query } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional(),
			offset: z.coerce.number().nonnegative().default(0)
		})
	});
	const userContent = await database.getUserContent(auth().pid);
	if (!userContent) {
		throw new Error('Usercontent not found on new page');
	}
	const communityMap = getCommunityHash();
	const posts = await database.getNewsFeedOffset(userContent, config.postLimit, query.offset);

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		nextLink: `/feed/more?offset=${query.offset + posts.length}&pjax=true`
	};

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	// TODO port ctr and portal
	return res.jsxForDirectory({
		web: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		portal: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		ctr: <CtrPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />
	});
});

feedRouter.get('/all/more', async function (req, res) {
	const { auth, query } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional(),
			offset: z.coerce.number().nonnegative().default(0)
		})
	});
	const userContent = await database.getUserContent(auth().pid);
	if (!userContent) {
		throw new Error('Usercontent not found on new page');
	}
	const communityMap = getCommunityHash();

	const posts = await POST.find({
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(query.offset).limit(config.postLimit).sort({ created_at: -1 });

	const bundle = {
		posts,
		numPosts: posts.length,
		open: true,
		communityMap,
		userContent,
		nextLink: `/feed/all/more?offset=${query.offset + posts.length}&pjax=true`
	};

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	// TODO port ctr and portal
	return res.jsxForDirectory({
		web: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		portal: <WebPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />,
		ctr: <CtrPostListView ctx={buildContext(res)} nextLink={bundle.nextLink} posts={bundle.posts} userContent={bundle.userContent} />
	});
});
