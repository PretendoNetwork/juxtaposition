import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { FeedTabsProps, FeedViewProps } from '@/services/juxt-web/views/web/feed';

export function CtrFeedTabs(props: FeedTabsProps): ReactNode {
	return (
		<CtrNavTabs target=".tab-body">
			<CtrNavTabsRow>
				<CtrNavTab href="/feed" selected={props.selected === 0}>
					<T k="global.my_feed" />
				</CtrNavTab>
				<CtrNavTab href="/feed/people" selected={props.selected === 1}>
					<T k="global.people_feed_short" />
				</CtrNavTab>
				<CtrNavTab href="/feed/all" selected={props.selected === 2}>
					<T k="global.global_feed_short" />
				</CtrNavTab>
			</CtrNavTabsRow>
		</CtrNavTabs>
	);
}

export function CtrPersonalFeedView(props: FeedViewProps): ReactNode {
	const title = T.str('global.activity_feed');
	return (
		<CtrRoot title={title}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="2"
				>
					{title}
				</CtrPageTitledHeader>
				<div className="body-content tab2-content" id="community-post-list">
					<CtrFeedTabs selected={0} />
					<div className="tab-body post-list">
						<CtrPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}

export function CtrPeopleFeedView(props: FeedViewProps): ReactNode {
	const title = T.str('global.activity_feed');
	return (
		<CtrRoot title={title}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="2"
				>
					{title}
				</CtrPageTitledHeader>
				<div className="body-content tab2-content" id="community-post-list">
					<CtrFeedTabs selected={1} />
					<div className="tab-body post-list">
						<CtrPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}

export function CtrGlobalFeedView(props: FeedViewProps): ReactNode {
	const title = T.str('global.activity_feed');
	return (
		<CtrRoot title={title}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="2"
				>
					{title}
				</CtrPageTitledHeader>
				<div className="body-content tab2-content" id="community-post-list">
					<CtrFeedTabs selected={2} />
					<div className="tab-body post-list">
						<CtrPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
