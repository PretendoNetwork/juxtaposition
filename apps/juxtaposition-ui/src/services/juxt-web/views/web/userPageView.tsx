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
import type { SelfContent, UserBadgeEnum, UserProfile } from '@/api/generated';

export type UserMissingPageViewProps = {
	pid: number;
	isBanned: boolean;
	isDeleted: boolean;
};

export type UserPageViewProps = {
	baseLink: string;
	selectedTab: number;
	children?: ReactNode;
	profile: UserProfile;
	requestUserContent: SelfContent | null;
};

export function WebUserMissingPage(props: UserMissingPageViewProps): ReactNode {
	const user = useUser();

	const userExists = props.isBanned || props.isDeleted;
	let title = <T k="user_page.not_found" />;
	if (props.isBanned) {
		title = <T k="user_page.banned" />;
	} else if (props.isDeleted) {
		title = <T k="user_page.deleted" />;
	}

	return (
		<WebRoot>
			<h2 id="title" className="page-header"><T k="global.user_page" /></h2>
			<WebNavBar selection={-1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<div className="community-top">
					<img className="banner" src="/assets/web/images/banner.png" alt="" />
					<div className="community-info">
						<img className="user-icon" src="/assets/web/images/bandwidthlost.png" />
						<h2 className="community-title">{title}</h2>
					</div>
					{user.perms.moderator && userExists
						? (
								<div className="info-boxes-wrapper">
									<div>
										<h4 id="user-page-download-tab"><a className="moderate" href={`/admin/accounts/${props.pid}`}><T k="moderation.moderate_user" /></a></h4>
									</div>
								</div>
							)
						: null}
				</div>
			</WebWrapper>
		</WebRoot>
	);
}

export function WebUserTier(props: { flags: UserBadgeEnum[] }): ReactNode {
	const parts: ReactNode[] = [];

	if (props.flags.includes('support:mario')) {
		parts.push(
			<span className="supporter-star mario">
				|
				<WebUIIcon name="star-badge" />
			</span>
		);
	}
	if (props.flags.includes('support:super')) {
		parts.push(
			<span className="supporter-star super">
				|
				<WebUIIcon name="star-badge" />
			</span>
		);
	}
	if (props.flags.includes('support:mega')) {
		parts.push(
			<span className="supporter-star mega">
				|
				<WebUIIcon name="star-badge" />
			</span>
		);
	}

	if (props.flags.includes('al:dev')) {
		parts.push(
			<span className="supporter-star dev">
				|
				<WebUIIcon name="dev-badge" />
			</span>
		);
	}
	if (props.flags.includes('al:mod')) {
		parts.push(
			<span className="supporter-star mega">
				|
				<WebUIIcon name="mod-badge" />
			</span>
		);
	}
	if (props.flags.includes('al:tester')) {
		parts.push(
			<span className="supporter-star tester">
				|
				<WebUIIcon name="tester-badge" />
			</span>
		);
	}

	return parts;
}

export function WebUserPageMeta(props: { profile: UserProfile; withImage?: boolean }): ReactNode {
	const url = useUrl();
	const profile = props.profile;
	const pnidName = props.profile.miiName;
	const pageTitle = `Juxt - ${pnidName}`;
	const pageImage = url.cdn(`/mii/${profile.pid}/smile_open_mouth.png`);
	return (
		<>
			<title>{pageTitle}</title>

			{/* Google / Search Engine Tags */}
			<meta itemProp="name" content={pageTitle} />
			{profile.profileInfo.comment ? <meta itemProp="description" content={profile.profileInfo.comment} /> : null}
			{ props.withImage ? <meta itemProp="image" content={pageImage} /> : null }

			{/* Open Graph Meta Tags */}
			<meta property="og:title" content={pageTitle} />
			{profile.profileInfo.comment ? <meta property="og:description" content={profile.profileInfo.comment} /> : null}
			<meta property="og:url" content={`https://juxt.pretendo.network/users/${profile.pid}`} />
			{ props.withImage ? <meta property="og:image" content={pageImage} /> : null }
			<meta property="og:site_name" content="Juxtaposition" />

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={pageTitle} />
			{profile.profileInfo.comment ? <meta name="twitter:description" content={profile.profileInfo.comment} /> : null}
			<meta name="twitter:site" content="@PretendoNetwork" />
			{ props.withImage ? <meta name="twitter:image" content={pageImage} /> : null }
			<meta name="twitter:creator" content="@PretendoNetwork" />

		</>
	);
}

export function WebUserPageView(props: UserPageViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const profile = props.profile;
	const isSelf = user.pid === props.profile.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(profile.pid) ?? false;

	const head: ReactNode = <WebUserPageMeta profile={props.profile} />;

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header"><T k="global.user_page" /></h2>
			<WebNavBar selection={isSelf ? 0 : -1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box">
				<div className="community-top">
					<img className="banner" src="/assets/web/images/banner.png" alt="" />
					<div className={cx('community-info', {
						active: profile.isOnline
					})}
					>
						<img className={cx('user-icon', { verified: profile.flags.includes('verified') })} src={url.cdn(`/mii/${profile.pid}/normal_face.png`)} />
						<h2 className="community-title">
							{profile.miiName}
							{' '}
							@
							{profile.username}
							{ profile.flags.includes('verified') ? <span className="verified-badge">✓</span> : null}
						</h2>
						{ !isSelf
							? (
									<>
										<a
											href="#"
											className={cx('favorite-button', { checked: isRequesterFollowingUser })}
											evt-click="follow(this)"
											data-sound="SE_WAVE_CHECKBOX_UNCHECK"
											data-url="/users/follow"
											data-community-id={profile.pid}
											data-text={isRequesterFollowingUser ? T.str('user_page.follow_user') : T.str('user_page.following_user')}
										>
											{isRequesterFollowingUser ? <T k="user_page.following_user" /> : <T k="user_page.follow_user" />}
										</a>
									</>
								)
							: null }
					</div>
					<h4 className="community-description">
						{profile.profileInfo.comment ?? <T k="global.private" />}
						<WebUserTier flags={profile.flags} />
					</h4>
					<div className="info-boxes-wrapper">
						<div>
							<h4><T k="user_page.country" /></h4>
							<h4>{profile.profileInfo.country ?? <T k="global.private" />}</h4>
						</div>
						<div>
							<h4><T k="user_page.birthday" /></h4>
							<h4>{profile.profileInfo.birthday ? moment(profile.profileInfo.birthday).format('MMM Do') : <T k="global.private" />}</h4>
						</div>
						<div>
							<h4><T k="user_page.game_experience" /></h4>
							{ profile.profileInfo.gameSkill !== null
								? (
										<h4>
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
										</h4>
									)
								: <h4><T k="global.private" /></h4>}
						</div>
						<div>
							<h4><T k="user_page.followers" /></h4>
							<h4 id="user-page-followers-tab">{profile.followers}</h4>
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
										<h4 id="user-page-download-tab"><a className="moderate" href={`/admin/accounts/${profile.pid}`}><T k="moderation.moderate_user" /></a></h4>
									</div>
								)
							: null}
					</div>

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
