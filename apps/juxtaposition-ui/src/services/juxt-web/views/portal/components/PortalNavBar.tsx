import { T } from '@/services/juxt-web/views/common/components/T';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import type { ReactNode } from 'react';

export type NavBarProps = {
	selection: number;
};

export function PortalNavBar(props: NavBarProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const selectedClasses = (id: number): string =>
		id === props.selection ? 'selected' : '';

	return (
		<menu id="nav-menu" data-navbar>
			{/* Selectable tabs */}
			<li
				id="nav-menu-me"
				data-navbar-tab="me"
				className={selectedClasses(0)}
			>
				<a href="/users/me" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<span className="mii-icon">
						<img
							src={url.cdn(`/mii/${user.pid}/normal_face.png`)}
							alt="User Page"
						/>
					</span>
					<span><T k="global.user_page" /></span>
				</a>
			</li>
			<li
				id="nav-menu-feed"
				data-navbar-tab="feed"
				className={selectedClasses(1)}
			>
				<a href="/feed" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.activity_feed" />
				</a>
			</li>
			<li
				id="nav-menu-community"
				data-navbar-tab="titles"
				className={selectedClasses(2)}
			>
				<a href="/titles" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.communities" />
				</a>
			</li>
			<li
				id="nav-menu-friends"
				data-navbar-tab="friends"
				className={selectedClasses(3)}
			>
				<a href="/news/friend_requests" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.friend_requests" />
				</a>
			</li>
			<li
				id="nav-menu-news"
				data-navbar-tab="news"
				className={selectedClasses(4)}
			>
				<a href="/news/my_news" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.notifications" />
					<span id="news-badge" className="badge">
						0
					</span>
				</a>
			</li>
			{/* Oneshot buttons */}
			<li id="nav-menu-exit">
				{/* Sound is handled in exit() callback */}
				<a role="button" data-navbar-exit>
					<T k="global.close" />
				</a>
			</li>
			<li id="nav-menu-back" className="none">
				{/* Sound is handled in back() callback */}
				<a role="button" data-navbar-back>
					<T k="global.go_back" />
				</a>
			</li>
		</menu>
	);
}
