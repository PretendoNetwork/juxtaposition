import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalNewPostView } from '@/services/juxt-web/views/portal/newPostView';
import { PortalPostListClosedView } from '@/services/juxt-web/views/portal/postList';
import { PortalIcon } from '@/services/juxt-web/views/portal/icons';
import type { ReactNode } from 'react';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';

export function PortalCommunityView(props: CommunityViewProps): ReactNode {
	const community = props.community;
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const bannerUrl = community.wup_header
		? utils.cdn(props.ctx, community.wup_header)
		: utils.cdn(props.ctx, `/headers/${imageId}/WiiU.png`);

	return (
		<PortalRoot title={community.name}>
			<PortalNavBar ctx={props.ctx} selection={2} />
			<PortalPageBody>
				<header id="header">
					{props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button"
									href="#"
									data-sound="SE_WAVE_SELECT_TAB"
									data-module-hide="community-post-list"
									data-module-show="add-post-page"
									data-header="false"
									data-menu="false"
								>
									Post
								</a>
							)
						: null}
					{props.hasSubCommunities
						? (
								<a id="header-communities-button" href="related" data-pjax="#body">Related Communities</a>
							)
						: null}
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="header-banner-container">
						<img src={bannerUrl} className="header-banner with-top-button" />
					</div>

					<div className="community-info info-content with-header-banner">
						<span className="icon-container">
							<img
								src={utils.cdn(props.ctx, `/icons/${imageId}/128.png`)}
								className="icon"
							/>
						</span>
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
								<PortalIcon name="posts" />
								{props.totalPosts}
							</span>
							<span>
								|
								<PortalIcon name="followers" />
								<span id="followers">
									{community.followers}
								</span>
							</span>
						</span>
					</div>
					<menu className="tab-header">
						<li id="tab-header-post" className={cx('tab-button', { selected: props.feedType === 0 })}>
							<a
								href={`/titles/${community.olive_community_id}/new`}
								data-sound="SE_WAVE_SELECT_TAB"
							>
								<span className="new-post">
									{props.ctx.lang.community.recent}
								</span>
							</a>
						</li>
						<li id="tab-header-hot-post" className={cx('tab-button', { selected: props.feedType === 1 })}>
							<a
								href={`/titles/${community.olive_community_id}/hot`}
								data-sound="SE_WAVE_SELECT_TAB"
							>
								<span>
									{props.ctx.lang.community.popular}
								</span>
							</a>
						</li>
					</menu>
					<div id="new-post-button-container" className="none">
						<a href="#" className="button" data-offset="10">
							{props.ctx.lang.global.more}
						</a>
						<div id="new-post"></div>
					</div>
					<div className="tab-body post-list">
						{!community.permissions.open ? <PortalPostListClosedView /> : null}
						{props.children}
					</div>
				</div>
				<PortalNewPostView ctx={props.ctx} id={community.olive_community_id} name={community.name} url="/posts/new" show="community-post-list" />
			</PortalPageBody>
		</PortalRoot>
	);
}
