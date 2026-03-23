import cx from 'classnames';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';

export type FeedViewProps = {
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
					<T k="global.my_feed" />
				</a>
				<a
					id="people-feed"
					href="/feed/people"
					className={cx({
						selected: props.selected == 1
					})}
				>
					<T k="global.people_feed" />
				</a>
				<a
					id="all-feed"
					href="/feed/all"
					className={cx({
						selected: props.selected == 2
					})}
				>
					<T k="global.global_feed" />
				</a>
			</div>
		</>
	);
}

export function WebPersonalFeedView(props: FeedViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.activity_feed" />
			</h2>
			<WebNavBar selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebFeedTabs selected={0} />
				<WebPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}

export function WebPeopleFeedView(props: FeedViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.activity_feed" />
			</h2>
			<WebNavBar selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebFeedTabs selected={1} />
				<WebPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}

export function WebGlobalFeedView(props: FeedViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.activity_feed" />
			</h2>
			<WebNavBar selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebFeedTabs selected={2} />
				<WebPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}
