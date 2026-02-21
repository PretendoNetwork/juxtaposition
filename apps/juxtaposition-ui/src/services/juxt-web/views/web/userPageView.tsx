import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { WebIcon } from '@/services/juxt-web/views/web/icons';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
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
				<WebIcon name="star-badge" />
			</span>
		);
	}
	if (tierName === 'Super Mario') {
		tierPart = (
			<span className="supporter-star super">
				|
				<WebIcon name="star-badge" />
			</span>
		);
	}
	if (tierName === 'Mega Mushroom') {
		tierPart = (
			<span className="supporter-star mega">
				|
				<WebIcon name="star-badge" />
			</span>
		);
	}

	if (props.user.accessLevel === 3) {
		accessLevelPart = (
			<span className="supporter-star dev">
				|
				<WebIcon name="dev-badge" />
			</span>
		);
	}
	if (props.user.accessLevel === 2) {
		accessLevelPart = (
			<span className="supporter-star mega">
				|
				<WebIcon name="mod-badge" />
			</span>
		);
	}
	if (props.user.accessLevel === 1) {
		accessLevelPart = (
			<span className="supporter-star tester">
				|
				<WebIcon name="tester-badge" />
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
	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || props.ctx.moderator;
	const isSelf = props.ctx.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;
	const isUserFollowingRequester = props.userContent.followed_users.includes(props.ctx.pid);

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
						<img className={cx('user-icon', { verified: props.user.accessLevel > 2 })} src={isUserDataViewable ? url.cdn(`/mii/${props.user.pid}/normal_face.png`) : '/images/bandwidthlost.png'} />
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
