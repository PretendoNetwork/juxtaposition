import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebUserPageMeta, WebUserTier } from '@/services/juxt-web/views/web/userPageView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { AdminUserProfile } from '@/api/generated';

type ModerateUserTabsProps = {
	pid: number;
	selected: 'overview' | 'removed' | 'posts' | 'reports';
};

export type ModerateUserViewProps = {
	profile: AdminUserProfile;
	tab: ModerateUserTabsProps['selected'];
	children?: ReactNode;
};

export function ModerateUserTabs(props: ModerateUserTabsProps): ReactNode {
	const base = `/admin/accounts/${props.pid}`;
	return (
		<div className="buttons tabs" style={{ marginBottom: 25 }}>
			<a className={cx({ selected: props.selected === 'overview' })} href={base + '/'}>Overview</a>
			<a className={cx({ selected: props.selected === 'removed' })} href={base + '/removed'}>Removed</a>
			<a className={cx({ selected: props.selected === 'posts' })} href={base + '/posts'}>Posts</a>
			<a className={cx({ selected: props.selected === 'reports' })} href={base + '/reports'}>Reports</a>
		</div>
	);
}

export function WebModerateUserView(props: ModerateUserViewProps): ReactNode {
	const url = useUrl();
	const profile = props.profile;
	const pnidName = profile.miiName;
	const head = (
		<>
			<WebUserPageMeta profile={props.profile} withImage />
		</>
	);

	return (
		<WebRoot type="admin" head={head}>
			<h2 id="title" className="page-header">
				Moderation profile
			</h2>
			<WebNavBar selection={-1} />
			<div id="toast"></div>
			<WebWrapper>
				<div className="community-top community-top-dark">
					<div className="community-info">
						<img className={cx('user-icon', { verified: profile.flags.includes('verified') })} src={url.cdn(`/mii/${profile.pid}/normal_face.png`)} />
						<h2 className="community-title">
							{pnidName}
							{' '}
							@
							{profile.username}
							{profile.flags.includes('verified') ? <span className="verified-badge">✓</span> : null}
						</h2>
					</div>
					<h4 className="community-description">
						{profile.profileInfo.comment}
						<WebUserTier flags={profile.flags} />
					</h4>
					<div className="info-boxes-wrapper">
						<div>
							<h4><T k="user_page.country" /></h4>
							<h4>{profile.profileInfo.country}</h4>
						</div>
						<div>
							<h4><T k="user_page.birthday" /></h4>
							<h4>{moment(profile.profileInfo.birthday).format('MMM Do')}</h4>
						</div>
						<div>
							<h4><T k="user_page.game_experience" /></h4>
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
						</div>
						<div>
							<h4><T k="user_page.followers" /></h4>
							<h4 id="user-page-followers-tab">{profile.followers}</h4>
						</div>
					</div>
					<div className="info-boxes-wrapper">
						<div>
							<h4>Account status</h4>
							<h4>{profile.moderation.status}</h4>
						</div>
						<div>
							<h4><a href={`/users/${profile.pid}`}>Go to profile</a></h4>
						</div>
					</div>
				</div>
				<ModerateUserTabs pid={profile.pid} selected={props.tab} />
				{props.children}
			</WebWrapper>
		</WebRoot>
	);
}
