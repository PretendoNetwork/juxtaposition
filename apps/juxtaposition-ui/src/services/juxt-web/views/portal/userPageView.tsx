import cx from 'classnames';
import moment from 'moment';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalUIIcon } from '@/services/juxt-web/views/portal/components/ui/PortalUIIcon';
import { PortalNavTab, PortalNavTabs, PortalNavTabsRow } from '@/services/juxt-web/views/portal/components/ui/PortalNavTabs';
import type { ReactNode } from 'react';
import type { UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';

export function PortalUserTier(props: { user: UserPageViewProps['user'] }): ReactNode {
	const tierName = props.user.tierName;
	let tierPart: ReactNode = null;
	let accessLevelPart: ReactNode = null;

	if (tierName === 'Mario') {
		tierPart = (
			<span className="supporter-star mario">
				{' | '}
				<PortalUIIcon name="star-badge" />
			</span>
		);
	}
	if (tierName === 'Super Mario') {
		tierPart = (
			<span className="supporter-star super">
				{' | '}
				<PortalUIIcon name="star-badge" />
			</span>
		);
	}
	if (tierName === 'Mega Mushroom') {
		tierPart = (
			<span className="supporter-star mega">
				{' | '}
				<PortalUIIcon name="star-badge" />
			</span>
		);
	}

	if (props.user.accessLevel === 3) {
		accessLevelPart = (
			<span className="supporter-star dev">
				{' | '}
				<PortalUIIcon name="dev-badge" />
			</span>
		);
	}
	if (props.user.accessLevel === 2) {
		accessLevelPart = (
			<span className="supporter-star mega">
				{' | '}
				<PortalUIIcon name="mod-badge" />
			</span>
		);
	}
	if (props.user.accessLevel === 1) {
		accessLevelPart = (
			<span className="supporter-star tester">
				{' | '}
				<PortalUIIcon name="tester-badge" />
			</span>
		);
	}

	return (
		<>
			{tierPart}
			{accessLevelPart}
		</>
	);
}

export function PortalUserPageView(props: UserPageViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const pnidName = props.user.mii?.name ?? props.user.username;

	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || user.perms.moderator;
	const isSelf = user.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;

	return (
		<PortalRoot title={pnidName}>
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<header id="header">
					{isSelf ? <a id="header-communities-button" className="user-page" href="/users/me/settings" data-pjax="#body">Settings</a> : null}
				</header>

				<div className="body-content tab2-content" id="community-post-list">
					<div className="header-banner-container">
						<img src="/assets/portal/images/banner.png" className="header-banner with-top-button" />
					</div>
					<div className="community-info info-content with-header-banner">
						<span className="icon-container">
							<img className={cx('icon', { verified: props.user.accessLevel > 2 })} src={isUserDataViewable ? url.cdn(`/mii/${props.user.pid}/normal_face.png`) : '/assets/portal/images/bandwidthlost.png'} />
						</span>
						{canViewUser && !isSelf
							? (
									<>
										<a href="#" className={cx('favorite-button favorite-button-mini button', { checked: isRequesterFollowingUser })} evt-click="follow(this)" data-sound="SE_WAVE_CHECKBOX_UNCHECK" data-url="/users/follow" data-community-id={props.user.pid}></a>
									</>
								)
							: null}
						<span className="title">
							{ isUserBanned ? <T k="user_page.banned" /> : isUserDeleted ? <T k="user_page.deleted" /> : null}
							{ isUserDataViewable ? pnidName : null}
						</span>
						<span className="text">
							{canViewUser
								? (
										<>
											<span>
												@
												{props.user.username}
											</span>
											<span>
												{' | '}
												<PortalUIIcon name="posts" />
												{' '}
												{props.totalPosts}
											</span>
											<span>
												{' | '}
												<PortalUIIcon name="followers" />
												{' '}
												<span id="followers">{props.userContent.following_users.length}</span>
											</span>
											{props.userSettings.country_visibility
												? (
														<span>
															{' | '}
															<PortalUIIcon name="country" />
															{' '}
															{props.user.country}
														</span>
													)
												: null}
											{props.userSettings.birthday_visibility
												? (
														<span>
															{' | '}
															<PortalUIIcon name="birthday" />
															{' '}
															{moment.utc(props.user.birthdate).format('MMM Do')}
														</span>
													)
												: null}
											{props.userSettings.game_skill_visibility
												? (
														<span>
															{' | '}
															<PortalUIIcon name="skill" />
															{' '}
															{props.userSettings.game_skill === 0
																? (
																		<><T k="setup.experience_text.beginner" /></>
																	)
																: props.userSettings.game_skill === 1
																	? (
																			<><T k="setup.experience_text.intermediate" /></>
																		)
																	: props.userSettings.game_skill === 2
																		? (
																				<><T k="setup.experience_text.expert" /></>
																			)
																		: <><T k="user_page.game_experience_unknown" /></>}
														</span>
													)
												: null}
											<PortalUserTier user={props.user} />
										</>
									)
								: null}
						</span>
					</div>
					{canViewUser
						? (
								<>
									<PortalNavTabs target=".tab-body">
										<PortalNavTabsRow>
											<PortalNavTab href={props.baseLink} selected={props.selectedTab === 0}>
												<T k="user_page.posts" />
											</PortalNavTab>
											<PortalNavTab href={props.baseLink + 'friends'} selected={props.selectedTab === 1}>
												<T k="user_page.friends" />
											</PortalNavTab>
											<PortalNavTab href={props.baseLink + 'following'} selected={props.selectedTab === 2}>
												<T k="user_page.following" />
											</PortalNavTab>
											<PortalNavTab href={props.baseLink + 'followers'} selected={props.selectedTab === 3}>
												<T k="user_page.followers" />
											</PortalNavTab>
											<PortalNavTab href={props.baseLink + 'yeahs'} selected={props.selectedTab === 4}>
												<T k="global.yeahs" />
											</PortalNavTab>
										</PortalNavTabsRow>
									</PortalNavTabs>
									<div className="tab-body post-list">
										{props.children}
									</div>
								</>
							)
						: null}
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
