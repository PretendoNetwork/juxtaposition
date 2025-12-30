import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';

export type TopicTagViewProps = {
	ctx: RenderContext;
	title: string;
	userContent: InferSchemaType<typeof ContentSchema>;
	posts: InferSchemaType<typeof PostSchema>[];
	nextLink: string;
};

export function WebTopicTagView(props: TopicTagViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				{props.ctx.lang.global.activity_feed}
			</h2>
			<WebNavBar ctx={props.ctx} selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}
