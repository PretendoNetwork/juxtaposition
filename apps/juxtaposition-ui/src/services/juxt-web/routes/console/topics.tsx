import express from 'express';
import { z } from 'zod';
import { config } from '@/config';
import { POST } from '@/models/post';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import { PortalTopicTagView } from '@/services/juxt-web/views/portal/topics';
import { WebTopicTagView } from '@/services/juxt-web/views/web/topics';
import { CtrTopicTagView } from '@/services/juxt-web/views/ctr/topics';

export const topicsRouter = express.Router();

topicsRouter.get('/', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			limit: z.coerce.number().min(1).max(config.postLimit).optional().default(config.postLimit),
			topic_tag: z.string()
		})
	});

	const userContent = hasAuth() ? auth().self.content : null;
	const posts = await POST.find({ topic_tag: query.topic_tag }).sort({ created_at: -1 }).limit(query.limit);

	const nextLink = `/topics/more?${new URLSearchParams({
		topic_tag: query.topic_tag,
		offset: `${posts.length}`,
		pjax: 'true'
	})}`;

	if (query.pjax) {
		return res.jsxForDirectory({
			web: <WebPostListView nextLink={nextLink} posts={posts} userContent={userContent} />,
			portal: <PortalPostListView nextLink={nextLink} posts={posts} userContent={userContent} />,
			ctr: <CtrPostListView nextLink={nextLink} posts={posts} userContent={userContent} />
		});
	}

	const title = query.topic_tag;
	return res.jsxForDirectory({
		web: <WebTopicTagView title={title} nextLink={nextLink} posts={posts} userContent={userContent} />,
		portal: <PortalTopicTagView title={title} nextLink={nextLink} posts={posts} userContent={userContent} />,
		ctr: <CtrTopicTagView title={title} nextLink={nextLink} posts={posts} userContent={userContent} />
	});
});

topicsRouter.get('/more', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			limit: z.coerce.number().min(1).max(config.postLimit).optional().default(config.postLimit),
			offset: z.coerce.number(),
			topic_tag: z.string()
		})
	});

	const userContent = hasAuth() ? auth().self.content : null;
	const posts = await POST.find({ topic_tag: query.topic_tag }).sort({ created_at: -1 }).skip(query.offset).limit(query.limit);

	const nextLink = `/topics/more?${new URLSearchParams({
		topic_tag: query.topic_tag,
		offset: (query.offset + posts.length).toString(),
		pjax: 'true'
	})}`;

	if (posts.length === 0) {
		return res.sendStatus(204);
	}

	return res.jsxForDirectory({
		web: <WebPostListView nextLink={nextLink} posts={posts} userContent={userContent} />,
		portal: <PortalPostListView nextLink={nextLink} posts={posts} userContent={userContent} />,
		ctr: <CtrPostListView nextLink={nextLink} posts={posts} userContent={userContent} />
	});
});
