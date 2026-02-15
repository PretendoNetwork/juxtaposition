import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';
import type { UserPageViewProps } from '@/services/juxt-web/views/web/userPageView';

export function CtrUserPageView(props: UserPageViewProps): ReactNode {
	const pnidName = props.user.mii?.name ?? props.user.username;

	const isUserBanned = (props.userSettings.account_status < 0 || props.userSettings.account_status > 1 || props.user.accessLevel < 0);
	const isUserDeleted = props.user.deleted;
	const isUserDataViewable = !isUserBanned && !isUserDeleted;
	const canViewUser = isUserDataViewable || props.ctx.moderator;
	const isSelf = props.ctx.pid === props.user.pid;

	const isRequesterFollowingUser = props.requestUserContent?.followed_users.includes(props.user.pid) ?? false;

	return (
		<CtrRoot ctx={props.ctx} title={pnidName}>
			<CtrPageBody>
				<header
					id="header"
					className="buttons"
					data-toolbar-config
					data-toolbar-mode="0"
					data-toolbar-active-button={isSelf ? '5' : undefined}
				>
					<h1 id="page-title" className="community">
						<span>
							<span className="icon-container">
								<img className="icon" src={isUserDataViewable ? utils.cdn(props.ctx, `/mii/${props.user.pid}/normal_face.png`) : '/images/bandwidthlost.png'} />
							</span>
							<span className="community-name">
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
							</span>
							{isUserDataViewable
								? (
										<span className="text">
											<span>
												<span className="sprite sp-post-count inline-sprite"></span>
												<span id="post-count">{props.totalPosts}</span>
											</span>
											<span>
												|
												<span className="sprite sp-follower-count inline-sprite"></span>
												<span id="followers">{props.userContent.following_users.length - 1}</span>
											</span>
										</span>
									)
								: null }
						</span>
					</h1>
					{isSelf ? <a id="header-communities-button" className="header-button left" href="/users/me/settings" data-pjax="#body">Settings</a> : null}
					{ canViewUser && !isSelf
						? (
								<button type="button" className={cx('submit follow yeah-button', { selected: isRequesterFollowingUser })} evt-click="follow(this)" data-sound="SE_WAVE_CHECKBOX_UNCHECK" data-url="/users/follow" data-community-id={props.user.pid}>
									<span className="sprite sp-yeah inline-sprite"></span>
								</button>
							)
						: null}
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					{isUserDataViewable
						? (
								<>
									<menu className="tab-header user-page no-margin">
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
										{isSelf
											? (
													<li id="tab-header-yeahs" className="tab-button">
														<a href="/news/friend_requests" data-sound="SE_WAVE_SELECT_TAB">
															<span>Requests</span>
														</a>
													</li>
												)
											: null}
									</menu>
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
