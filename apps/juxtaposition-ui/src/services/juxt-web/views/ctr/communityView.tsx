import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPostListClosedView } from '@/services/juxt-web/views/ctr/postList';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrCommunityIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrCommunityIcon';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import { CtrPageHeaderStat, CtrPageIconHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrPageButton, CtrPageButtons } from '@/services/juxt-web/views/ctr/components/CtrPageButtons';
import type { ReactNode } from 'react';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';

export function CtrCommunityView(props: CommunityViewProps): ReactNode {
	const url = useUrl();
	const community = props.community;
	const header = url.ctrHeader(community);

	return (
		<CtrRoot title={community.name}>
			<CtrPageBody>
				<CtrPageIconHeader
					header={header}
					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					<CtrCommunityIcon type="header-icon" community={community} size="64" />
					<div className="title">
						<span>{community.name}</span>
					</div>
					<div className="stats">
						<CtrPageHeaderStat sprite="sp-follower-count">
							<div id="followers">{community.followerCount}</div>
						</CtrPageHeaderStat>
						<CtrPageHeaderStat sprite="sp-post-count">
							<div id="post-count">{props.totalPosts}</div>
						</CtrPageHeaderStat>
					</div>
				</CtrPageIconHeader>
				<CtrPageButtons>
					{props.canPost
						? (
								<CtrPageButton
									type="left"
									href={`/titles/${community.olive_community_id}/create`}
								>
									<T k="new_post.new_post_short" />
									{' +'}
								</CtrPageButton>
							)
						: null}

					{community.permissions.open
						? (
								<CtrPageButton
									type="middle"
									sprite={cx('sp-yeah', {
										selected: props.isUserFollowing
									})}
									evt-click="follow(this)"
									data-url="/titles/follow"
									data-community-id={community.olive_community_id}
								>
								</CtrPageButton>
							)
						: null }
					{props.hasSubCommunities
						? (
								<CtrPageButton
									type="right"
									href={`/titles/${community.olive_community_id}/related`}
								>
									<T k="community.related_short" />
								</CtrPageButton>
							)
						: null}
				</CtrPageButtons>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="community-info info-content with-header-banner">
					</div>
					<CtrNavTabs target=".tab-body">
						<CtrNavTabsRow>
							<CtrNavTab href={`/titles/${community.olive_community_id}/new`} selected={props.feedType === 0}>
								<T k="community.recent" />
							</CtrNavTab>
							<CtrNavTab href={`/titles/${community.olive_community_id}/hot`} selected={props.feedType === 1}>
								<T k="community.popular" />
							</CtrNavTab>
						</CtrNavTabsRow>
					</CtrNavTabs>
					<div className="tab-body post-list">
						{!community.permissions.open ? <CtrPostListClosedView /> : null}
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
