import express from 'express';
import { z } from 'zod';
import { config } from '@/config';
import { POST } from '@/models/post';
import { parseReq } from '@/services/juxt-web/routes/routeUtils';
import { buildPostListLinks, WebPostListView } from '@/services/juxt-web/views/web/postList';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import { PortalTopicTagView } from '@/services/juxt-web/views/portal/topics';
import { WebTopicTagView } from '@/services/juxt-web/views/web/topics';
import { CtrTopicTagView } from '@/services/juxt-web/views/ctr/topics';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';

export const topicsRouter = express.Router();

topicsRouter.get('/', async function (req, res) {
	const { auth, hasAuth, query } = parseReq(req, {
		query: z.object({
			pjax: z.stringbool().optional(),
			limit: z.coerce.number().min(1).max(config.postLimit).optional().default(config.postLimit),
			topic_tag: z.string(),
			offset: z.coerce.number().optional().default(0)
		})
	});

	const offset = query.offset;
	const userContent = hasAuth() ? auth().self.content : null;
	const posts = await POST.find({
		topic_tag: query.topic_tag,
		parent: null,
		removed: false
	}).sort({ created_at: -1 }).skip(offset).limit(query.limit);

	const link = `/topics?${new URLSearchParams({
		topic_tag: query.topic_tag
	})}`;

	const postListProps: PostListViewProps = {
		...buildPostListLinks(link, offset, posts.length),
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

	const title = query.topic_tag;
	return res.jsxForDirectory({
		web: (
			<WebTopicTagView title={title}>
				<WebPostListView {...postListProps} />
			</WebTopicTagView>
		),
		portal: (
			<PortalTopicTagView title={title}>
				<PortalPostListView {...postListProps} />
			</PortalTopicTagView>
		),
		ctr: (
			<CtrTopicTagView title={title}>
				<CtrPostListView {...postListProps} />
			</CtrTopicTagView>
		)
	});
});
