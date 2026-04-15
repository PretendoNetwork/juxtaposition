import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import type { ReactNode } from 'react';
import type { UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';

export function CtrUserPageView(props: UserPageViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const profile = props.profile;
	const pnidName = profile.miiName;
	const isSelf = user.pid === profile.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(profile.pid) ?? false;

	return (
		<CtrRoot title={pnidName}>
			<CtrPageBody>
				<header
					id="header"
					className="buttons"

					data-toolbar-mode="normal"
					data-toolbar-active-button={isSelf ? '5' : undefined}
				>
					<h1 id="page-title" className="community">
						<span>
							<span className="icon-container">
								<img className="icon" src={url.cdn(`/mii/${profile.pid}/normal_face.png`)} />
							</span>
							<span className="community-name">
								{pnidName}
								{' '}
								@
								{profile.username}
							</span>
							<span className="text">
								<span>
									<span className="sprite sp-post-count inline-sprite"></span>
									<span id="post-count">
										{' '}
										{profile.posts}
									</span>
								</span>
								<span>
									{' | '}
									<span className="sprite sp-follower-count inline-sprite"></span>
									<span id="followers">
										{' '}
										{profile.followers}
									</span>
								</span>
							</span>
						</span>
					</h1>
					{isSelf ? <a id="header-communities-button" className="header-button left" href="/users/me/settings" data-pjax="#body"><T k="user_page.settings" /></a> : null}
					{ !isSelf
						? (
								<button type="button" className="small-button follow" evt-click="follow(this)" data-sound="SE_WAVE_CHECKBOX_UNCHECK" data-url="/users/follow" data-community-id={profile.pid}>
									<span className={cx('sprite sp-yeah inline-sprite', { selected: isRequesterFollowingUser })}></span>
								</button>
							)
						: null}
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<CtrNavTabs target=".tab-body">
						<CtrNavTabsRow>
							<CtrNavTab href={props.baseLink} selected={props.selectedTab === 0}>
								<T k="user_page.posts" />
							</CtrNavTab>
							<CtrNavTab href={props.baseLink + 'friends'} selected={props.selectedTab === 1}>
								<T k="user_page.friends" />
							</CtrNavTab>
							<CtrNavTab href={props.baseLink + 'following'} selected={props.selectedTab === 2}>
								<T k="user_page.following" />
							</CtrNavTab>
						</CtrNavTabsRow>
						<CtrNavTabsRow>
							<CtrNavTab href={props.baseLink + 'followers'} selected={props.selectedTab === 3}>
								<T k="user_page.followers" />
							</CtrNavTab>
							<CtrNavTab href={props.baseLink + 'yeahs'} selected={props.selectedTab === 4}>
								<T k="global.yeahs" />
							</CtrNavTab>
							{isSelf
								? (
										<CtrNavTab href="/news/friend_requests">
											<T k="user_page.friend_requests" />
										</CtrNavTab>
									)
								: null }
						</CtrNavTabsRow>
					</CtrNavTabs>
					<div className="tab-body post-list">
						{props.children}
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
