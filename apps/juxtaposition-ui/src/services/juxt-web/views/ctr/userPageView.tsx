import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrNavTab, CtrNavTabs, CtrNavTabsRow } from '@/services/juxt-web/views/ctr/components/ui/CtrNavTabs';
import { CtrPageHeaderStat, CtrPageIconHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrPageButton, CtrPageButtons } from '@/services/juxt-web/views/ctr/components/CtrPageButtons';
import type { ReactNode } from 'react';
import type { UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';

export function CtrUserPageView(props: UserPageViewProps): ReactNode {
	const user = useUser();
	const pnidName = props.user.mii?.name ?? props.user.username;

	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || user.perms.moderator;
	const isSelf = user.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;

	return (
		<CtrRoot title={pnidName}>
			<CtrPageBody>
				<CtrPageIconHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button={isSelf ? '5' : undefined}
				>
					<CtrMiiIcon type="header-icon" banned={!isUserDataViewable} pid={props.user.pid}></CtrMiiIcon>
					<div className="title">
						<span>
							{ isUserBanned ? <T k="user_page.banned" /> : isUserDeleted ? <T k="user_page.deleted" /> : null}
							{ isUserDataViewable
								? (
										<>
											{props.user.mii?.name ?? props.user.username}
											{' '}
											@
											{props.user.username}
										</>
									)
								: null}
						</span>
					</div>
					<div className="stats">
						<CtrPageHeaderStat sprite="sp-follower-count">
							<div id="followers">{props.userContent.following_users.length}</div>
						</CtrPageHeaderStat>
						<CtrPageHeaderStat sprite="sp-post-count">
							<div id="post-count">{props.totalPosts}</div>
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

					{canViewUser && !isSelf
						? (
								<CtrPageButton
									type="middle"
									sprite={cx('sp-yeah', {
										selected: isRequesterFollowingUser
									})}

									evt-click="follow(this)"
									data-url="/users/follow"
									data-community-id={props.user.pid}
								>
								</CtrPageButton>
							)
						: null}
				</CtrPageButtons>

				<div className="body-content tab2-content" id="community-post-list">
					{canViewUser
						? (
								<>
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
								</>
							)
						: null}
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
