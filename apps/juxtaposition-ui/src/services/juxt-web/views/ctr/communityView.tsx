import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPostListClosedView } from '@/services/juxt-web/views/ctr/postList';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import type { ReactNode } from 'react';
import type { CommunityViewProps } from '@/services/juxt-web/views/web/communityView';

export function CtrCommunityView(props: CommunityViewProps): ReactNode {
	const url = useUrl();
	const community = props.community;
	const { bannerUrl, imageId, legacy } = url.ctrHeader(community);

	return (
		<CtrRoot title={community.name}>
			<CtrPageBody>
				<header
					id="header"
					style={{
						background: `url('${bannerUrl}')`
					}}
					className={cx('buttons', {
						'header-legacy': legacy
					})}

					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					<h1 id="page-title" className="community">
						<span>
							<span className="icon-container">
								<img src={url.cdn(`/icons/${imageId}/64.png`)} className="icon" />
							</span>
							<span className="community-name">
								{community.name}
							</span>
							<span className="text">
								<span>
									<span className="sprite sp-post-count inline-sprite"></span>
									<span id="post-count">
										{' '}
										{props.totalPosts}
									</span>
								</span>
								<span>
									{' | '}
									<span className="sprite sp-follower-count inline-sprite"></span>
									<span id="followers">
										{' '}
										{community.followers}
									</span>
								</span>
							</span>
						</span>
					</h1>
					{props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button left"
									href={`/titles/${community.olive_community_id}/create`}
									data-pjax="#body"
								>
									<T k="new_post.new_post_short" />
									{' +'}
								</a>
							)
						: null}
					{props.hasSubCommunities
						? (
								<a id="header-communities-button" className="right" href={`/titles/${community.olive_community_id}/related`} data-pjax="#body"><T k="community.related" /></a>
							)
						: null}
					{community.permissions.open
						? (
								<button
									type="button"
									className={cx('small-button follow', {
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
