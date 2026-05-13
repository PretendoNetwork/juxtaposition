import express from 'express';
import { z } from 'zod';
import { config } from '@/config';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebGlobalFeedView, WebPeopleFeedView, WebPersonalFeedView } from '@/services/juxt-web/views/web/feed';
import { buildPostListLinks, WebPostListView } from '@/services/juxt-web/views/web/postList';
import { CtrGlobalFeedView, CtrPeopleFeedView, CtrPersonalFeedView } from '@/services/juxt-web/views/ctr/feed';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { PortalGlobalFeedView, PortalPeopleFeedView, PortalPersonalFeedView } from '@/services/juxt-web/views/portal/feed';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';

export const feedRouter = express.Router();

feedRouter.get('/', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			offset: z.coerce.number().optional().default(0)
		})
	});

	const offset = query.offset;
	const userContent = hasAuth() ? auth().self.content : null;
	if (!userContent) {
		return res.redirect('/404');
	}

	const postPage = await req.api.activityFeed.getFollowing({ limit: config.postLimit, offset });
	const posts = postPage.data.items;

	const postListProps: PostListViewProps = {
		...buildPostListLinks('/feed', offset, posts.length),
		posts,
		userContent
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}

	return res.jsxForDirectory({
		web: (
			<WebPersonalFeedView>
				<WebPostListView {...postListProps} />
			</WebPersonalFeedView>
		),
		portal: (
			<PortalPersonalFeedView>
				<PortalPostListView {...postListProps} />
			</PortalPersonalFeedView>
		),
		ctr: (
			<CtrPersonalFeedView>
				<CtrPostListView {...postListProps} />
			</CtrPersonalFeedView>
		)
	});
});

feedRouter.get('/people', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			offset: z.coerce.number().optional().default(0)
		})
	});

	const offset = query.offset;
	const userContent = hasAuth() ? auth().self.content : null;
	if (!userContent) {
		return res.redirect('/404');
	}

	const postPage = await req.api.activityFeed.getPeople({ limit: config.postLimit, offset });
	const posts = postPage.data.items;

	const postListProps: PostListViewProps = {
		...buildPostListLinks('/feed/people', offset, posts.length),
		posts,
		userContent
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}

	return res.jsxForDirectory({
		web: (
			<WebPeopleFeedView>
				<WebPostListView {...postListProps} />
			</WebPeopleFeedView>
		),
		portal: (
			<PortalPeopleFeedView>
				<PortalPostListView {...postListProps} />
			</PortalPeopleFeedView>
		),
		ctr: (
			<CtrPeopleFeedView>
				<CtrPostListView {...postListProps} />
			</CtrPeopleFeedView>
		)
	});
});

feedRouter.get('/all', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			offset: z.coerce.number().optional().default(0)
		})
	});

	const offset = query.offset;
	const userContent = hasAuth() ? auth().self.content : null;
	if (!userContent) {
		return res.redirect('/404');
	}

	const postPage = await req.api.activityFeed.getFresh({ limit: config.postLimit, offset });
	const posts = postPage.data.items;

	const postListProps: PostListViewProps = {
		...buildPostListLinks('/feed/all', offset, posts.length),
		posts,
		userContent
	};

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView {...postListProps} />,
			portal: <PortalPostListView {...postListProps} />,
			ctr: <CtrPostListView {...postListProps} />
		});
	}

	return res.jsxForDirectory({
		web: (
			<WebGlobalFeedView>
				<WebPostListView {...postListProps} />
			</WebGlobalFeedView>
		),
		portal: (
			<PortalGlobalFeedView>
				<PortalPostListView {...postListProps} />
			</PortalGlobalFeedView>
		),
		ctr: (
			<CtrGlobalFeedView>
				<CtrPostListView {...postListProps} />
			</CtrGlobalFeedView>
		)
	});
});
