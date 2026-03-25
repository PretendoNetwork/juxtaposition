import cx from 'classnames';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPostListClosedView } from '@/services/juxt-web/views/portal/postList';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalCommunityIcon } from '@/services/juxt-web/views/portal/components/ui/PortalCommunityIcon';
import { PortalUIIcon } from '@/services/juxt-web/views/portal/components/ui/PortalUIIcon';
import { PortalNavTab, PortalNavTabs, PortalNavTabsRow } from '@/services/juxt-web/views/portal/components/ui/PortalNavTabs';
import type { ReactNode } from 'react';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';

export function PortalCommunityView(props: CommunityViewProps): ReactNode {
	const url = useUrl();
	const community = props.community;
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const bannerUrl = community.wup_header
		? url.cdn(community.wup_header)
		: url.cdn(`/headers/${imageId}/WiiU.png`);

	return (
		<PortalRoot title={community.name}>
			<PortalNavBar selection={2} />
			<PortalPageBody>
				<header id="header">
					{props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button"
									href={`/titles/${community.olive_community_id}/create`}
									data-pjax="#body"
								>
									<T k="new_post.new_post_short" />
								</a>
							)
						: null}
					{props.hasSubCommunities
						? (
								<a id="header-communities-button" href="related" data-pjax="#body">
									<T k="community.related" />
								</a>
							)
						: null}
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="header-banner-container">
						<img src={bannerUrl} className="header-banner with-top-button" />
					</div>

					<div className="community-info info-content with-header-banner">
						<PortalCommunityIcon community={community} size="128"></PortalCommunityIcon>
						{community.permissions.open
							? (
									<a
										href="#"
										className={cx('favorite-button button', {
											checked: props.isUserFollowing
										})}
										evt-click="follow(this)"
										data-sound="SE_WAVE_CHECKBOX_UNCHECK"
										data-url="/titles/follow"
										data-community-id={community.olive_community_id}
									/>
								)
							: null}
						<span className="title">{community.name}</span>
						<span className="text">
							<span>
								<PortalUIIcon name="posts" />
								{' '}
								{props.totalPosts}
							</span>
							<span>
								{' | '}
								<PortalUIIcon name="followers" />
								{' '}
								<span id="followers">
									{community.followers}
								</span>
							</span>
						</span>
					</div>
					<PortalNavTabs target=".tab-body">
						<PortalNavTabsRow>
							<PortalNavTab href={`/titles/${community.olive_community_id}/new`} selected={props.feedType === 0}>
								<T k="community.recent" />
							</PortalNavTab>
							<PortalNavTab href={`/titles/${community.olive_community_id}/hot`} selected={props.feedType === 1}>
								<T k="community.popular" />
							</PortalNavTab>
						</PortalNavTabsRow>
					</PortalNavTabs>
					<div id="new-post-button-container" className="none">
						<a href="#" className="button" data-offset="10">
							<T k="global.more" />
						</a>
						<div id="new-post"></div>
					</div>
					<div className="tab-body post-list">
						{!community.permissions.open ? <PortalPostListClosedView /> : null}
						{props.children}
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
