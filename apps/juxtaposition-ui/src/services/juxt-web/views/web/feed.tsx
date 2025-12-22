import cx from 'classnames';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';

export type FeedViewProps = {
	ctx: RenderContext;
	title: string;
	userContent: InferSchemaType<typeof ContentSchema>;
	posts: InferSchemaType<typeof PostSchema>[];
	nextLink: string;
};

export type FeedTabsProps = {
	selected: number;
};

export function WebFeedTabs(props: FeedTabsProps): ReactNode {
	return (
		<>
			<div className="buttons tabs" style={{ marginBottom: '1.5em' }}>
				<a
					id="my-feed"
					href="/feed"
					className={cx({
						selected: props.selected == 0
					})}
				>
					My Feed
				</a>
				<a
					id="all-feed"
					href="/feed/all"
					className={cx({
						selected: props.selected == 1
					})}
				>
					Global Feed
				</a>
			</div>
		</>
	);
}

export function WebPersonalFeedView(props: FeedViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				{props.ctx.lang.global.activity_feed}
			</h2>
			<WebNavBar ctx={props.ctx} selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebFeedTabs selected={0} />
				<WebPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}

export function WebGlobalFeedView(props: FeedViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				{props.ctx.lang.global.activity_feed}
			</h2>
			<WebNavBar ctx={props.ctx} selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebFeedTabs selected={1} />
				<WebPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}
