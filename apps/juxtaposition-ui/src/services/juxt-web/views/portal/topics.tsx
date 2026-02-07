import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import type { ReactNode } from 'react';
import type { TopicTagViewProps } from '@/services/juxt-web/views/web/topics';

export function PortalTopicTagView(props: TopicTagViewProps): ReactNode {
	return (
		<PortalRoot ctx={props.ctx} title={props.title} onLoad="stopLoading();wiiuBrowser.lockUserOperation(false);">
			<PortalNavBar ctx={props.ctx} selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className="left">{props.title}</h1>
				</header>
				<div id="new-post-button-container" className="none">
					<a href="#" className="button" data-offset="10" evt-click="loadFeedPosts(this)">{props.ctx.lang.global.more}</a>
					<div id="new-post"></div>
				</div>
				<div className="body-content" id="activity-feed">
					<div className="tab-body post-list">
						<PortalPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
