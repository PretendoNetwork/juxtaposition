import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalNewPostView } from '@/services/juxt-web/views/portal/newPostView';
import { PortalPostListClosedView } from '@/services/juxt-web/views/portal/postList';
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
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="23"
									fill="#ffffff"
									viewBox="0 0 256 200"
								>
									<rect width="256" height="256" fill="none"></rect>
									<polygon
										points="128 160 96 160 96 128 192 32 224 64 128 160"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</polygon>
									<line
										x1="164"
										y1="60"
										x2="196"
										y2="92"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</line>
									<path
										d="M216,128.6V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8h79.4"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</path>
								</svg>
								{props.totalPosts}
							</span>
							<span>
								|
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="23"
									fill="#ffffff"
									viewBox="0 0 256 200"
								>
									<rect width="256" height="256" fill="none"></rect>
									<line
										x1="204"
										y1="136"
										x2="244"
										y2="136"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</line>
									<line
										x1="224"
										y1="116"
										x2="224"
										y2="156"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</line>
									<circle
										cx="108"
										cy="100"
										r="60"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</circle>
									<path
										d="M22.2,200a112,112,0,0,1,171.6,0"
										fill="none"
										stroke="#ffffff"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="24"
									>
									</path>
								</svg>
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
