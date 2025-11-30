import cx from 'classnames';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPostListView } from '@/services/juxt-web/views/portal/postList';
import type { ReactNode } from 'react';
import type { FeedTabsProps, FeedViewProps } from '@/services/juxt-web/views/web/feed';

export function PortalFeedTabs(props: FeedTabsProps): ReactNode {
	return (
		<menu className="tab-header">
			<li
				id="tab-header-my-feed"
				className={cx('tab-button', {
					selected: props.selected === 0
				})}
				data-show-post-button="1"
			>
				<a href="/feed/" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
					<span className="new-post">My Feed</span>
				</a>
			</li>
			<li
				id="tab-header-global-feed"
				className={cx('tab-button', {
					selected: props.selected === 1
				})}
			>
				<a href="/feed/all" data-pjax-cache-container="#body" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
					<span>Global Feed</span>
				</a>
			</li>
		</menu>
	);
}

export function PortalPersonalFeedView(props: FeedViewProps): ReactNode {
	return (
		<PortalRoot title={props.title} onLoad="stopLoading();wiiuBrowser.lockUserOperation(false);">
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
					<PortalFeedTabs selected={0} />
					<div className="tab-body post-list">
						<PortalPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}

export function PortalGlobalFeedView(props: FeedViewProps): ReactNode {
	return (
		<PortalRoot title={props.title} onLoad="stopLoading();wiiuBrowser.lockUserOperation(false);">
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
					<PortalFeedTabs selected={1} />
					<div className="tab-body post-list">
						<PortalPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
