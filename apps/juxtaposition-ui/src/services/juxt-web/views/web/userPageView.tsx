import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { ContentSchema } from '@/models/content';
import type { HydratedSettingsDocument } from '@/models/settings';

export type UserPageViewProps = {
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
				<WebUIIcon name="star-badge" />
			</span>
		);
	}
	if (tierName === 'Super Mario') {
		tierPart = (
			<span className="supporter-star super">
				|
				<WebUIIcon name="star-badge" />
			</span>
		);
	}
	if (tierName === 'Mega Mushroom') {
		tierPart = (
			<span className="supporter-star mega">
				|
				<WebUIIcon name="star-badge" />
			</span>
		);
	}

	if (props.user.accessLevel === 3) {
		accessLevelPart = (
			<span className="supporter-star dev">
				|
				<WebUIIcon name="dev-badge" />
			</span>
		);
	}
	if (props.user.accessLevel === 2) {
		accessLevelPart = (
			<span className="supporter-star mega">
				|
				<WebUIIcon name="mod-badge" />
			</span>
		);
	}
	if (props.user.accessLevel === 1) {
		accessLevelPart = (
			<span className="supporter-star tester">
				|
				<WebUIIcon name="tester-badge" />
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

export function WebUserPageMeta(props: { user: GetUserDataResponse; userSettings: HydratedSettingsDocument; withImage?: boolean }): ReactNode {
	const url = useUrl();
	const pnidName = props.user.mii?.name ?? props.user.username;
	const pageTitle = `Juxt - ${pnidName}`;
	const pageImage = url.cdn(`/mii/${props.userSettings.pid}/smile_open_mouth.png`);
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
	const url = useUrl();
	const user = useUser();
	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || user.perms.moderator;
	const isSelf = user.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;
	const isUserFollowingRequester = props.userContent.followed_users.includes(user.pid);

	let head: ReactNode = null;
	if (isUserDataViewable) {
		head = <WebUserPageMeta user={props.user} userSettings={props.userSettings} />;
	}

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header"><T k="global.user_page" /></h2>
			<WebNavBar selection={-1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<div className="community-top">
					<img className="banner" src="/assets/web/images/banner.png" alt="" />
					<div className={cx('community-info', {
						active: props.isOnline
					})}
					>
						<img className={cx('user-icon', { verified: props.user.accessLevel > 2 })} src={isUserDataViewable ? url.cdn(`/mii/${props.user.pid}/normal_face.png`) : '/assets/web/images/bandwidthlost.png'} />
						<h2 className="community-title">
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
											data-text={isRequesterFollowingUser ? <T k="user_page.follow_user" /> : <T k="user_page.following_user" />}
										>
											{isRequesterFollowingUser ? <T k="user_page.following_user" /> : <T k="user_page.follow_user" />}
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
										{props.userSettings.profile_comment_visibility ? props.userSettings.profile_comment : <T k="global.private" />}
										<WebUserTier user={props.user} />
									</h4>
									<div className="info-boxes-wrapper">
										<div>
											<h4><T k="user_page.country" /></h4>
											<h4>{props.userSettings.country_visibility ? props.user.country : <T k="global.private" />}</h4>
										</div>
										<div>
											<h4><T k="user_page.birthday" /></h4>
											<h4>{props.userSettings.birthday_visibility ? moment.utc(props.user.birthdate).format('MMM Do') : <T k="global.private" />}</h4>
										</div>
										<div>
											<h4><T k="user_page.game_experience" /></h4>
											{ props.userSettings.game_skill_visibility
												? (
														<h4>
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
														</h4>
													)
												: <h4><T k="global.private" /></h4>}
										</div>
										<div>
											<h4><T k="user_page.followers" /></h4>
											<h4 id="user-page-followers-tab">{props.userContent.following_users.length}</h4>
										</div>
										{isSelf
											? (
													<div>
														<h4><T k="user_settings.gdpr_download" /></h4>
														<h4 id="user-page-download-tab">
															<a href="/users/downloadUserData.json">
																<T k="user_settings.gdpr_download_action" />
															</a>
														</h4>
													</div>
												)
											: null}
										{user.perms.moderator
											? (
													<div>
														<h4 id="user-page-download-tab"><a className="moderate" href={`/admin/accounts/${props.user.pid}`}><T k="moderation.moderate_user" /></a></h4>
													</div>
												)
											: null}
									</div>
								</>
							)
						: null}
				</div>
				<div className="buttons tabs">
					<a id="tab-header-post" className={props.selectedTab === 0 ? 'selected' : ''} href={props.baseLink}><T k="user_page.posts" /></a>
					<a id="tab-header-friends" className={props.selectedTab === 1 ? 'selected' : ''} href={props.baseLink + 'friends'}><T k="user_page.friends" /></a>
					<a id="tab-header-following" className={props.selectedTab === 2 ? 'selected' : ''} href={props.baseLink + 'following'}><T k="user_page.following" /></a>
					<a id="tab-header-followers" className={props.selectedTab === 3 ? 'selected' : ''} href={props.baseLink + 'followers'}><T k="user_page.followers" /></a>
					<a id="tab-header-yeahs" className={props.selectedTab === 4 ? 'selected' : ''} href={props.baseLink + 'yeahs'}><T k="global.yeahs" /></a>
				</div>
				{props.children}
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}
