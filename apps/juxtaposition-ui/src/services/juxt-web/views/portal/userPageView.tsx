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
import type { UserProfile } from '@/api/generated';

export function PortalUserTier(props: { profile: UserProfile }): ReactNode {
	const flags = props.profile.flags;
	const parts: ReactNode[] = [];

	if (flags.includes('support:mario')) {
		parts.push(
			<span className="supporter-star mario">
				{' | '}
				<PortalUIIcon name="star-badge" />
			</span>
		);
	}
	if (flags.includes('support:super')) {
		parts.push(
			<span className="supporter-star super">
				{' | '}
				<PortalUIIcon name="star-badge" />
			</span>
		);
	}
	if (flags.includes('support:mega')) {
		parts.push(
			<span className="supporter-star mega">
				{' | '}
				<PortalUIIcon name="star-badge" />
			</span>
		);
	}

	if (flags.includes('al:dev')) {
		parts.push(
			<span className="supporter-star dev">
				{' | '}
				<PortalUIIcon name="dev-badge" />
			</span>
		);
	}
	if (flags.includes('al:mod')) {
		parts.push(
			<span className="supporter-star mega">
				{' | '}
				<PortalUIIcon name="mod-badge" />
			</span>
		);
	}
	if (flags.includes('al:tester')) {
		parts.push(
			<span className="supporter-star tester">
				{' | '}
				<PortalUIIcon name="tester-badge" />
			</span>
		);
	}

	return parts;
}

export function PortalUserPageView(props: UserPageViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const profile = props.profile;
	const pnidName = profile.miiName;
	const isSelf = user.pid === profile.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(profile.pid) ?? false;
	const isUserFollowingRequester = props.isUserFollowingRequester;

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
							<img className={cx('icon', { verified: profile.flags.includes('verified') })} src={url.cdn(`/mii/${profile.pid}/normal_face.png`)} />
						</span>
						{!isSelf
							? (
									<>
										<a href="#" className={cx('favorite-button favorite-button-mini button', { checked: isRequesterFollowingUser })} evt-click="follow(this)" data-sound="SE_WAVE_CHECKBOX_UNCHECK" data-url="/users/follow" data-community-id={profile.pid}></a>
										{ isRequesterFollowingUser && isUserFollowingRequester ? <a href={`/friend_messages/new/${profile.pid}`} className="message-button favorite-button-mini button" data-sound="SE_WAVE_CHECKBOX_UNCHECK"></a> : null }
									</>
								)
							: null}
						<span className="title">
							{pnidName}
						</span>
						<span className="text">
							<span>
								@
								{profile.username}
							</span>
							<span>
								{' | '}
								<PortalUIIcon name="posts" />
								{' '}
								{profile.posts}
							</span>
							<span>
								{' | '}
								<PortalUIIcon name="followers" />
								{' '}
								<span id="followers">{profile.followers}</span>
							</span>
							{profile.profileInfo.country
								? (
										<span>
											{' | '}
											<PortalUIIcon name="country" />
											{' '}
											{profile.profileInfo.country}
										</span>
									)
								: null}
							{profile.profileInfo.birthday
								? (
										<span>
											{' | '}
											<PortalUIIcon name="birthday" />
											{' '}
											{moment(profile.profileInfo.birthday).format('MMM Do')}
										</span>
									)
								: null}
							{profile.profileInfo.gameSkill
								? (
										<span>
											{' | '}
											<PortalUIIcon name="skill" />
											{' '}
											{profile.profileInfo.gameSkill === 0
												? (
														<><T k="setup.experience_text.beginner" /></>
													)
												: profile.profileInfo.gameSkill === 1
													? (
															<><T k="setup.experience_text.intermediate" /></>
														)
													: profile.profileInfo.gameSkill === 2
														? (
																<><T k="setup.experience_text.expert" /></>
															)
														: <><T k="user_page.game_experience_unknown" /></>}
										</span>
									)
								: null}
							<PortalUserTier profile={profile} />
						</span>
					</div>
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
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
