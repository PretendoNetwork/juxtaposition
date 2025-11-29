import express from 'express';
import { z } from 'zod';
import { database } from '@/database';
import { POST } from '@/models/post';
import { config } from '@/config';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebGlobalFeedView, WebPersonalFeedView } from '@/services/juxt-web/views/web/feed';
import { buildContext } from '@/services/juxt-web/views/context';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { CtrGlobalFeedView, CtrPersonalFeedView } from '@/services/juxt-web/views/ctr/feed';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { PortalGlobalFeedView, PortalPersonalFeedView } from '@/services/juxt-web/views/portal/feed';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';

export const feedRouter = express.Router();

feedRouter.get('/', async function (req, res) {
	const { auth, query } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional()
		})
	});
	const userContent = await database.getUserContent(auth().pid);
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await database.getNewsFeed(userContent, config.postLimit);

	const nextLink = `/feed/more?offset=${posts.length}&pjax=true`;

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
			portal: <PortalPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
			ctr: <CtrPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />
		});
	}

	const title = res.locals.lang.global.activity_feed;
	return res.jsxForDirectory({
		web: <WebPersonalFeedView ctx={buildContext(res)} title={title} nextLink={nextLink} posts={posts} userContent={userContent} />,
		portal: <PortalPersonalFeedView ctx={buildContext(res)} title={title} nextLink={nextLink} posts={posts} userContent={userContent} />,
		ctr: <CtrPersonalFeedView ctx={buildContext(res)} title={title} nextLink={nextLink} posts={posts} userContent={userContent} />
	});
});

feedRouter.get('/all', async function (req, res) {
	const { auth, query } = parseReq(req, {
		query: z.object({
			pjax: z.string().optional()
		})
	});
	const userContent = await database.getUserContent(auth().pid);
	if (!userContent) {
		return res.redirect('/404');
	}
	const posts = await POST.find({
		parent: null,
		message_to_pid: null,
		removed: false
	}).limit(config.postLimit).sort({ created_at: -1 });

	const nextLink = `/feed/all/more?offset=${posts.length}&pjax=true`;

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
			portal: <PortalPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
			ctr: <CtrPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />
		});
	}

	const title = res.locals.lang.global.activity_feed;
	return res.jsxForDirectory({
		web: <WebGlobalFeedView ctx={buildContext(res)} title={title} nextLink={nextLink} posts={posts} userContent={userContent} />,
		portal: <PortalGlobalFeedView ctx={buildContext(res)} title={title} nextLink={nextLink} posts={posts} userContent={userContent} />,
		ctr: <CtrGlobalFeedView ctx={buildContext(res)} title={title} nextLink={nextLink} posts={posts} userContent={userContent} />
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
	const posts = await database.getNewsFeedOffset(userContent, config.postLimit, query.offset);

	const nextLink = `/feed/more?offset=${query.offset + posts.length}&pjax=true`;

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	return res.jsxForDirectory({
		web: <WebPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
		portal: <PortalPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
		ctr: <CtrPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />
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

	const posts = await POST.find({
		parent: null,
		message_to_pid: null,
		removed: false
	}).skip(query.offset).limit(config.postLimit).sort({ created_at: -1 });

	const nextLink = `/feed/all/more?offset=${query.offset + posts.length}&pjax=true`;

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	return res.jsxForDirectory({
		web: <WebPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
		portal: <PortalPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />,
		ctr: <CtrPostListView ctx={buildContext(res)} nextLink={nextLink} posts={posts} userContent={userContent} />
	});
});
