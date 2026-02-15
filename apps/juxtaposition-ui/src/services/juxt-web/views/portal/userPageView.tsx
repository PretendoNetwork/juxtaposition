import cx from 'classnames';
import moment from 'moment';
import { utils } from '@/services/juxt-web/views/utils';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';

export function PortalUserTier(props: { user: UserPageViewProps['user'] }): ReactNode {
	const tierName = props.user.tierName;
	let tierPart: ReactNode = null;
	let accessLevelPart: ReactNode = null;

	if (tierName === 'Mario') {
		tierPart = (
			<span className="supporter-star mario">
				|
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
			</span>
		);
	}
	if (tierName === 'Super Mario') {
		tierPart = (
			<span className="supporter-star super">
				|
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
			</span>
		);
	}
	if (tierName === 'Mega Mushroom') {
		tierPart = (
			<span className="supporter-star mega">
				|
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
			</span>
		);
	}

	if (props.user.accessLevel === 3) {
		accessLevelPart = (
			<span className="supporter-star dev">
				|
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="rainbow" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-tool">
					<defs>
						<linearGradient id="rainbow">
							<stop offset="16%" stop-color="red" />
							<stop offset="32%" stop-color="orange" />
							<stop offset="48%" stop-color="yellow" />
							<stop offset="64%" stop-color="green" />
							<stop offset="80%" stop-color="blue" />
							<stop offset="96%" stop-color="purple" />
						</linearGradient>
					</defs>
					<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
				</svg>
			</span>
		);
	}
	if (props.user.accessLevel === 2) {
		accessLevelPart = (
			<span className="supporter-star mega">
				|
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
			</span>
		);
	}
	if (props.user.accessLevel === 1) {
		accessLevelPart = (
			<span className="supporter-star tester">
				|
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor">
					<path d="M104,32V93.8a8.4,8.4,0,0,1-1.1,4.1l-63.6,106A8,8,0,0,0,46.1,216H209.9a8,8,0,0,0,6.8-12.1l-63.6-106a8.4,8.4,0,0,1-1.1-4.1V32" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
					<line x1="88" y1="32" x2="168" y2="32" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
					<path d="M62.6,165c11.8-8.7,32.1-13.6,65.4,3,35.7,17.9,56.5,10.8,67.9,1.1" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
				</svg>
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
	const pnidName = props.user.mii?.name ?? props.user.username;

	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || props.ctx.moderator;
	const isSelf = props.ctx.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;
	const isUserFollowingRequester = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;

	return (
		<PortalRoot title={pnidName}>
			<PortalNavBar ctx={props.ctx} selection={-1} />
			<PortalPageBody>
				<header id="header">
					{isSelf ? <a id="header-communities-button" className="user-page" href="/users/me/settings" data-pjax="#body">Settings</a> : null}
				</header>

				<div className="body-content tab2-content" id="community-post-list">
					<div className="header-banner-container">
						<img src="/images/banner.png" className="header-banner with-top-button" />
					</div>
					<div className="community-info info-content with-header-banner">
						<span className="icon-container">
							<img className={cx('icon', { verified: props.user.accessLevel > 2 })} src={isUserDataViewable ? utils.cdn(props.ctx, `/mii/${props.user.pid}/normal_face.png`) : '/images/bandwidthlost.png'} />
						</span>
						{canViewUser && !isSelf
							? (
									<>
										<a href="#" className={cx('favorite-button favorite-button-mini button', { checked: isRequesterFollowingUser })} evt-click="follow(this)" data-sound="SE_WAVE_CHECKBOX_UNCHECK" data-url="/users/follow" data-community-id={props.user.pid}></a>
										{ isRequesterFollowingUser && isUserFollowingRequester ? <a href={`/friend_messages/new/${props.user.pid}`} className="message-button favorite-button-mini button" data-sound="SE_WAVE_CHECKBOX_UNCHECK"></a> : null }
									</>
								)
							: null}
						<span className="title">
							{ isUserBanned ? 'Banned User' : isUserDeleted ? 'Deleted User' : null}
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
												|
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="23" fill="#ffffff" viewBox="0 0 256 200">
													<rect width="256" height="256" fill="none"></rect>
													<polygon points="128 160 96 160 96 128 192 32 224 64 128 160" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></polygon>
													<line x1="164" y1="60" x2="196" y2="92" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
													<path d="M216,128.6V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8h79.4" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></path>
												</svg>
												{props.totalPosts}
											</span>
											<span>
												|
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="23" fill="#ffffff" viewBox="0 0 256 200">
													<rect width="256" height="256" fill="none"></rect>
													<line x1="204" y1="136" x2="244" y2="136" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
													<line x1="224" y1="116" x2="224" y2="156" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
													<circle cx="108" cy="100" r="60" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></circle>
													<path d="M22.2,200a112,112,0,0,1,171.6,0" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></path>
												</svg>
												<span id="followers">{props.userContent.following_users.length - 1}</span>
											</span>
											{props.userSettings.country_visibility
												? (
														<span>
															|
															<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ffffff" viewBox="0 0 256 256">
																<rect width="256" height="256" fill="none" />
																<circle cx="128" cy="128" r="96" fill="none" stroke="#ffffff" stroke-miterlimit="10" stroke-width="16" />
																<line x1="37.5" y1="96" x2="218.5" y2="96" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<line x1="37.5" y1="160" x2="218.5" y2="160" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<ellipse cx="128" cy="128" rx="40" ry="93.4" fill="none" stroke="#ffffff" stroke-miterlimit="10" stroke-width="16" />
															</svg>
															{props.user.country}
														</span>
													)
												: null}
											{props.userSettings.birthday_visibility
												? (
														<span>
															|
															<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ffffff" viewBox="0 0 256 256">
																<rect width="256" height="256" fill="none" />
																<line x1="128" y1="88" x2="128" y2="64" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<path d="M128,64c46.2-16,0-56,0-56S80,48,128,64Z" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<path d="M162,126a34,34,0,0,1-68,0" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<path d="M94,126a34,34,0,0,1-33.3,34c-19.1.4-34.7-15.6-34.7-34.7V112A23.9,23.9,0,0,1,50,88H206a23.9,23.9,0,0,1,24,24v13.3c0,19.1-15.6,35.1-34.7,34.7A34,34,0,0,1,162,126" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<path d="M216,153.3V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V153.3" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
															</svg>
															{moment.utc(props.user.birthdate).format('MMM Do')}
														</span>
													)
												: null}
											{props.userSettings.game_skill_visibility
												? (
														<span>
															|
															<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#ffffff" viewBox="0 0 256 256">
																<rect width="256" height="256" fill="none" />
																<line x1="152" y1="108" x2="184" y2="108" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<line x1="72" y1="108" x2="104" y2="108" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<line x1="88" y1="92" x2="88" y2="124" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<path d="M172,55.7,84,56A52.1,52.1,0,0,0,32.8,99h0L16.4,183.1a28,28,0,0,0,47.4,24.7h0L107,160l65-.3a52,52,0,1,0,0-104Z" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
																<path d="M223.2,98.7l16.4,84.4a28,28,0,0,1-47.4,24.7h0l-43.2-48" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
															</svg>
															{props.userSettings.game_skill === 0
																? (
																		<>{props.ctx.lang.setup.experience_text.beginner}</>
																	)
																: props.userSettings.game_skill === 1
																	? (
																			<>{props.ctx.lang.setup.experience_text.intermediate}</>
																		)
																	: props.userSettings.game_skill === 2
																		? (
																				<>{props.ctx.lang.setup.experience_text.expert}</>
																			)
																		: <>N/A</>}
														</span>
													)
												: null}
											<PortalUserTier user={props.user} />
										</>
									)
								: null}
						</span>
					</div>
					{isUserDataViewable
						? (
								<>
									<menu className="tab-header user-page">
										<li id="tab-header-post" className={cx('tab-button', { selected: props.selectedTab === 0 })}>
											<a href={props.baseLink} data-sound="SE_WAVE_SELECT_TAB">
												<span className="new-post">{props.ctx.lang.user_page.posts}</span>
											</a>
										</li>
										<li id="tab-header-friends" className={cx('tab-button', { selected: props.selectedTab === 1 })}>
											<a href={props.baseLink + 'friends'} data-sound="SE_WAVE_SELECT_TAB">
												<span>{props.ctx.lang.user_page.friends}</span>
											</a>
										</li>
										<li id="tab-header-following" className={cx('tab-button', { selected: props.selectedTab === 2 })}>
											<a href={props.baseLink + 'following'} data-sound="SE_WAVE_SELECT_TAB">
												<span>{props.ctx.lang.user_page.following}</span>
											</a>
										</li>
										<li id="tab-header-followers" className={cx('tab-button', { selected: props.selectedTab === 3 })}>
											<a href={props.baseLink + 'followers'} data-sound="SE_WAVE_SELECT_TAB">
												<span>{props.ctx.lang.user_page.following}</span>
											</a>
										</li>
										<li id="tab-header-yeahs" className={cx('tab-button', { selected: props.selectedTab === 4 })}>
											<a href={props.baseLink + 'yeahs'} data-sound="SE_WAVE_SELECT_TAB">
												<span>{props.ctx.lang.global.yeahs}</span>
											</a>
										</li>
									</menu>
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
