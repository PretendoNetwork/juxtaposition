import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import type { ReactNode } from 'react';
import type { FeedTabsProps, FeedViewProps } from '@/services/juxt-web/views/web/feed';

export function CtrFeedTabs(props: FeedTabsProps): ReactNode {
	return (
		<menu className="tab-header no-margin">
			<li
				id="tab-header-my-feed"
				className={cx('tab-button', {
					selected: props.selected === 0
				})}
				data-show-post-button="1"
			>
				<a href="/feed" data-pjax-replace="1" data-sound="SE_WAVE_SELECT_TAB">
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

export function CtrPersonalFeedView(props: FeedViewProps): ReactNode {
	return (
		<CtrRoot title={props.title}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title">{props.title}</h1>
				</header>
				<CtrFeedTabs selected={0} />
				<div className="body-content tab2-content" id="community-post-list">

					<div className="tab-body post-list">
						<CtrPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}

export function CtrGlobalFeedView(props: FeedViewProps): ReactNode {
	return (
		<CtrRoot title={props.title}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title">{props.title}</h1>
				</header>
				<CtrFeedTabs selected={1} />
				<div className="body-content tab2-content" id="community-post-list">

					<div className="tab-body post-list">
						<CtrPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
