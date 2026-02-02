import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrNewPostView } from '@/services/juxt-web/views/ctr/newPostView';
import { CtrPostListClosedView } from '@/services/juxt-web/views/ctr/postList';
import type { ReactNode } from 'react';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';

export function CtrCommunityView(props: CommunityViewProps): ReactNode {
	const community = props.community;
	const { bannerUrl, imageId, legacy } = utils.ctrHeader(props.ctx, community);

	return (
		<CtrRoot ctx={props.ctx} title={community.name}>
			<CtrPageBody>
				<header
					id="header"
					style={{
						background: `url('${bannerUrl}')`
					}}
					className={cx({
						'header-legacy': legacy
					})}
				>
					<h1 id="page-title" className="community">
						<span>
							<span className="icon-container">
								<img src={utils.cdn(props.ctx, `/icons/${imageId}/64.png`)} className="icon" />
							</span>
							<span className="community-name">
								{community.name}
							</span>
							<span className="text">
								<span>
									<span className="sprite sp-post-count inline-sprite"></span>
									<span id="post-count">
										{props.totalPosts}
									</span>
								</span>
								<span>
									|
									<span className="sprite sp-follower-count inline-sprite"></span>
									<span id="followers">{community.followers}</span>
								</span>
							</span>
						</span>
					</h1>
					{props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button left"
									href="#"
									data-sound="SE_WAVE_SELECT_TAB"
									data-module-hide="community-post-list"
									data-module-show="add-post-page"
									data-header="false"
									data-screenshot="true"
									data-message={`${props.ctx.lang.new_post.post_to} ${community.name}`}
								>
									Post +
								</a>
							)
						: null}
					{props.hasSubCommunities
						? (
								<a id="header-communities-button" className="right" href={`/titles/${community.olive_community_id}/related`} data-pjax="#body">Related Communities</a>
							)
						: null}
					{community.permissions.open
						? (
								<button
									type="button"
									className={cx('submit follow yeah-button', {
										suggested: props.hasSubCommunities,
										selected: props.isUserFollowing
									})}
									evt-click="follow(this)"
									data-sound="SE_WAVE_CHECKBOX_UNCHECK"
									data-url="/titles/follow"
									data-community-id={community.olive_community_id}
								>
									<span className="sprite sp-yeah inline-sprite"></span>
								</button>
							)
						: null}
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="community-info info-content with-header-banner">
					</div>
					<menu className="tab-header">
						<li id="tab-header-post" className={cx('tab-button', { selected: props.feedType === 0 })}>
							<a href={`/titles/${community.olive_community_id}/new`} data-sound="SE_WAVE_SELECT_TAB"><span className="new-post">{props.ctx.lang.community.recent}</span></a>
						</li>
						<li id="tab-header-hot-post" className={cx('tab-button', { selected: props.feedType === 1 })}>
							<a href={`/titles/${community.olive_community_id}/hot`} data-sound="SE_WAVE_SELECT_TAB"><span>{props.ctx.lang.community.popular}</span></a>
						</li>
					</menu>
					<div className="tab-body post-list">
						{!community.permissions.open ? <CtrPostListClosedView /> : null}
						{props.children}
					</div>
				</div>
				<CtrNewPostView
					ctx={props.ctx}
					id={community.olive_community_id}
					name={community.name}
					url="/posts/new"
					show="community-post-list"
					ctrBanner={bannerUrl}
					ctrLegacy={legacy}
					shotMode={community.shot_mode}
					shotTids={community.title_id.concat(community.shot_extra_title_id)}
				/>
			</CtrPageBody>
		</CtrRoot>
	);
}
