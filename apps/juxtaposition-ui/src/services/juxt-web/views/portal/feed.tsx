import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalNavTab, PortalNavTabs, PortalNavTabsRow } from '@/services/juxt-web/views/portal/components/ui/PortalNavTabs';
import type { ReactNode } from 'react';
import type { FeedTabsProps, FeedViewProps } from '@/services/juxt-web/views/web/feed';

export function PortalFeedTabs(props: FeedTabsProps): ReactNode {
	return (
		<PortalNavTabs target=".tab-body">
			<PortalNavTabsRow>
				<PortalNavTab href="/feed" selected={props.selected === 0}>
					<T k="global.my_feed" />
				</PortalNavTab>
				<PortalNavTab href="/feed/people" selected={props.selected === 1}>
					<T k="global.people_feed" />
				</PortalNavTab>
				<PortalNavTab href="/feed/all" selected={props.selected === 2}>
					<T k="global.global_feed" />
				</PortalNavTab>
			</PortalNavTabsRow>
		</PortalNavTabs>
	);
}

export function PortalPersonalFeedView(props: FeedViewProps): ReactNode {
	const title = T.str('global.activity_feed');
	return (
		<PortalRoot title={title} onLoad="stopLoading();wiiuBrowser.lockUserOperation(false);">
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className="left">{title}</h1>
				</header>
				<div id="new-post-button-container" className="none">
					<a href="#" className="button" data-offset="10" evt-click="loadFeedPosts(this)"><T k="global.more" /></a>
					<div id="new-post"></div>
				</div>
				<div className="body-content" id="activity-feed">
					<PortalFeedTabs selected={0} />
					<div className="tab-body post-list">
						<PortalPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}

export function PortalPeopleFeedView(props: FeedViewProps): ReactNode {
	const title = T.str('global.activity_feed');
	return (
		<PortalRoot title={title} onLoad="stopLoading();wiiuBrowser.lockUserOperation(false);">
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className="left">{title}</h1>
				</header>
				<div id="new-post-button-container" className="none">
					<a href="#" className="button" data-offset="10" evt-click="loadFeedPosts(this)"><T k="global.more" /></a>
					<div id="new-post"></div>
				</div>
				<div className="body-content" id="activity-feed">
					<PortalFeedTabs selected={1} />
					<div className="tab-body post-list">
						<PortalPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}

export function PortalGlobalFeedView(props: FeedViewProps): ReactNode {
	const title = T.str('global.activity_feed');
	return (
		<PortalRoot title={title} onLoad="stopLoading();wiiuBrowser.lockUserOperation(false);">
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className="left">{title}</h1>
				</header>
				<div id="new-post-button-container" className="none">
					<a href="#" className="button" data-offset="10" evt-click="loadFeedPosts(this)"><T k="global.more" /></a>
					<div id="new-post"></div>
				</div>
				<div className="body-content" id="activity-feed">
					<PortalFeedTabs selected={2} />
					<div className="tab-body post-list">
						<PortalPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
