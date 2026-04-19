import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebPostListView } from '@/services/juxt-web/views/web/postList';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { Post, SelfContent } from '@/api/generated';

export type TopicTagViewProps = {
	title: string;
	userContent: SelfContent | null;
	posts: Post[];
	nextLink: string;
};

export function WebTopicTagView(props: TopicTagViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.activity_feed" />
			</h2>
			<WebNavBar selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				<WebPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}
