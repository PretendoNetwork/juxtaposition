import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ContentSchema } from '@/models/content';
import type { HydratedSettingsDocument } from '@/models/settings';

export type UserPageViewProps = {
	ctx: RenderContext;
	baseLink: string;
	selectedTab: number;
	children?: ReactNode;
	totalPosts: number;
	friendPids: number[];
	user: GetUserDataResponse;
	userContent: InferSchemaType<typeof ContentSchema>;
	userSettings: HydratedSettingsDocument;
	isOnline: boolean;
	requestUserContent: InferSchemaType<typeof ContentSchema> | null;
};

export function WebUserTier(props: { user: GetUserDataResponse }): ReactNode {
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

export function WebUserPageMeta(props: { ctx: RenderContext; user: GetUserDataResponse; userSettings: HydratedSettingsDocument; withImage?: boolean }): ReactNode {
	const pnidName = props.user.mii?.name ?? props.user.username;
	const pageTitle = `Juxt - ${pnidName}`;
	const pageImage = utils.cdn(props.ctx, `/mii/${props.userSettings.pid}/smile_open_mouth.png`);
	return (
		<>
			<title>{pageTitle}</title>

			{/* Google / Search Engine Tags */}
			<meta itemProp="name" content={pageTitle} />
			{props.userSettings.profile_comment_visibility ? <meta itemProp="description" content={props.userSettings.profile_comment ?? undefined} /> : null}
			{ props.withImage ? <meta itemProp="image" content={pageImage} /> : null }

			{/* Open Graph Meta Tags */}
			<meta property="og:title" content={pageTitle} />
			{props.userSettings.profile_comment_visibility ? <meta property="og:description" content={props.userSettings.profile_comment ?? undefined} /> : null}
			<meta property="og:url" content={`https://juxt.pretendo.network/users/${props.userSettings.pid}`} />
			{ props.withImage ? <meta property="og:image" content={pageImage} /> : null }
			<meta property="og:site_name" content="Juxtaposition" />

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={pageTitle} />
			{props.userSettings.profile_comment_visibility ? <meta name="twitter:description" content={props.userSettings.profile_comment ?? undefined} /> : null}
			<meta name="twitter:site" content="@PretendoNetwork" />
			{ props.withImage ? <meta name="twitter:image" content={pageImage} /> : null }
			<meta name="twitter:creator" content="@PretendoNetwork" />

		</>
	);
}

export function WebUserPageView(props: UserPageViewProps): ReactNode {
	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || props.ctx.moderator;
	const isSelf = props.ctx.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;
	const isUserFollowingRequester = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;

	let head: ReactNode = null;
	if (isUserDataViewable) {
		head = <WebUserPageMeta ctx={props.ctx} user={props.user} userSettings={props.userSettings} />;
	}

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header">{props.ctx.lang.global.user_page}</h2>
			<WebNavBar ctx={props.ctx} selection={-1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<div className="community-top">
					<img className="banner" src="/images/banner.png" alt="" />
					<div className={cx('community-info', {
						active: props.isOnline
					})}
					>
						<img className={cx('user-icon', { verified: props.user.accessLevel > 2 })} src={isUserDataViewable ? utils.cdn(props.ctx, `/mii/${props.user.pid}/normal_face.png`) : '/images/bandwidthlost.png'} />
						<h2 className="community-title">
							{ isUserBanned ? 'Banned User' : isUserDeleted ? 'Deleted User' : null}
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
							{ props.user.accessLevel >= 2 ? <span className="verified-badge">✓</span> : null}
						</h2>
						{ canViewUser && !isSelf
							? (
									<>
										<a
											href="#"
											className={cx('favorite-button', { checked: isRequesterFollowingUser })}
											evt-click="follow(this)"
											data-sound="SE_WAVE_CHECKBOX_UNCHECK"
											data-url="/users/follow"
											data-community-id={props.user.pid}
											data-text={isRequesterFollowingUser ? props.ctx.lang.user_page.follow_user : props.ctx.lang.user_page.following_user}
										>
											{isRequesterFollowingUser ? props.ctx.lang.user_page.following_user : props.ctx.lang.user_page.follow_user}
										</a>
										{ isRequesterFollowingUser && isUserFollowingRequester ? <a href={`/friend_messages/new/${props.user.pid}`} className="message-button" data-sound="SE_WAVE_CHECKBOX_UNCHECK"></a> : null }
									</>
								)
							: null }
					</div>
					{canViewUser
						? (
								<>
									<h4 className="community-description">
										{props.userSettings.profile_comment_visibility ? props.userSettings.profile_comment : props.ctx.lang.global.private}
										<WebUserTier user={props.user} />
									</h4>
									<div className="info-boxes-wrapper">
										<div>
											<h4>{props.ctx.lang.user_page.country}</h4>
											<h4>{props.userSettings.country_visibility ? props.user.country : props.ctx.lang.global.private}</h4>
										</div>
										<div>
											<h4>{props.ctx.lang.user_page.birthday}</h4>
											<h4>{props.userSettings.birthday_visibility ? moment.utc(props.user.birthdate).format('MMM Do') : props.ctx.lang.global.private}</h4>
										</div>
										<div>
											<h4>{ props.ctx.lang.user_page.game_experience }</h4>
											{ props.userSettings.game_skill_visibility
												? (
														<h4>
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
														</h4>
													)
												: <h4>{props.ctx.lang.global.private}</h4>}
										</div>
										<div>
											<h4>{props.ctx.lang.user_page.followers}</h4>
											<h4 id="user-page-followers-tab">{props.userContent.following_users.length}</h4>
										</div>
										{isSelf
											? (
													<div>
														<h4>Download User Data</h4>
														<h4 id="user-page-download-tab"><a href="/users/downloadUserData.json">Download</a></h4>
													</div>
												)
											: null}
										{props.ctx.moderator
											? (
													<div>
														<h4 id="user-page-download-tab"><a className="moderate" href={`/admin/accounts/${props.user.pid}`}>Moderate User</a></h4>
													</div>
												)
											: null}
									</div>
								</>
							)
						: null}
				</div>
				<div className="buttons tabs">
					<a id="tab-header-post" className={props.selectedTab === 0 ? 'selected' : ''} href={props.baseLink}>{props.ctx.lang.user_page.posts}</a>
					<a id="tab-header-friends" className={props.selectedTab === 1 ? 'selected' : ''} href={props.baseLink + 'friends'}>{props.ctx.lang.user_page.friends}</a>
					<a id="tab-header-following" className={props.selectedTab === 2 ? 'selected' : ''} href={props.baseLink + 'following'}>{props.ctx.lang.user_page.following}</a>
					<a id="tab-header-followers" className={props.selectedTab === 3 ? 'selected' : ''} href={props.baseLink + 'followers'}>{props.ctx.lang.user_page.followers}</a>
					<a id="tab-header-yeahs" className={props.selectedTab === 4 ? 'selected' : ''} href={props.baseLink + 'yeahs'}>{props.ctx.lang.global.yeahs}</a>
				</div>
				{props.children}
			</WebWrapper>
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}
