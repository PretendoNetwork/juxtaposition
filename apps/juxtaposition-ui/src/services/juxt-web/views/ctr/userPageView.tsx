import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import { CtrPageHeaderStat, CtrPageIconHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrPageButton, CtrPageButtons } from '@/services/juxt-web/views/ctr/components/CtrPageButtons';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import type { ReactNode } from 'react';
import type { UserMissingPageViewProps, UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';

export function CtrUserMissingPage(props: UserMissingPageViewProps): ReactNode {
	let title = <T k="user_page.not_found" />;
	if (props.isBanned) {
		title = <T k="user_page.banned" />;
	} else if (props.isDeleted) {
		title = <T k="user_page.deleted" />;
	}

	return (
		<CtrRoot title={T.str('user_page.not_found')}>
			<CtrPageBody>
				<CtrPageIconHeader
					data-toolbar-mode="normal"
				>
					<CtrIcon type="header-icon" src="/assets/ctr/images/bandwidthlost.png" />
					<div className="title">
						<span>
							{title}
						</span>
					</div>
				</CtrPageIconHeader>
			</CtrPageBody>
		</CtrRoot>
	);
}

export function CtrUserPageView(props: UserPageViewProps): ReactNode {
	const user = useUser();
	const profile = props.profile;
	const pnidName = profile.miiName;
	const isSelf = user.pid === profile.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(profile.pid) ?? false;

	return (
		<CtrRoot title={T.str('user_page.not_found')}>
			<CtrPageBody>
				<CtrPageIconHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button={isSelf ? '5' : undefined}
				>
					<CtrMiiIcon type="header-icon" pid={profile.pid} />
					<div className="title">
						<span>
							{pnidName}
							{' '}
							@
							{profile.username}
						</span>
					</div>
					<div className="stats">
						<CtrPageHeaderStat sprite="sp-follower-count">
							<div id="followers">{profile.followers}</div>
						</CtrPageHeaderStat>
						<CtrPageHeaderStat sprite="sp-post-count">
							<div id="post-count">{profile.posts}</div>
						</CtrPageHeaderStat>
					</div>
				</CtrPageIconHeader>

				<CtrPageButtons>
					{isSelf
						? (
								<CtrPageButton
									type="left"
									href="/users/me/settings"
								>
									<T k="user_page.settings" />
								</CtrPageButton>
							)
						: null}

					{!isSelf
						? (
								<CtrPageButton
									type="middle"
									sprite={cx('sp-yeah', {
										selected: isRequesterFollowingUser
									})}

									evt-click="follow(this)"
									data-url="/users/follow"
									data-community-id={profile.pid}
								>
								</CtrPageButton>
							)
						: null}
				</CtrPageButtons>

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
