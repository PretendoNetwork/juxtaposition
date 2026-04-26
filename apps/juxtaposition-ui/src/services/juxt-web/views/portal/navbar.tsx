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
		<menu id="nav-menu">
			<li id="nav-menu-me" data-tab="me" className={selectedClasses(0)}>
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
			<li id="nav-menu-feed" data-tab="feed" className={selectedClasses(1)}>
				<a href="/feed" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.activity_feed" />
				</a>
			</li>
			<li
				id="nav-menu-community"
				data-tab="titles"
				className={selectedClasses(2)}
			>
				<a href="/titles" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.communities" />
				</a>
			</li>
			<li
				id="nav-menu-friends"
				data-tab="friends"
				className={selectedClasses(3)}
			>
				<a href="/news/friend_requests" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.friend_requests" />
				</a>
			</li>
			<li id="nav-menu-news" data-tab="news" className={selectedClasses(4)}>
				<a href="/news/my_news" data-pjax="#body" data-sound="SE_WAVE_MENU">
					<T k="global.notifications" />
					<span id="news-badge" className="badge">
						0
					</span>
				</a>
			</li>
			<li id="nav-menu-exit" evt-click="exit()">
				<a role="button" data-sound="SE_WAVE_EXIT" tabIndex={0}>
					<T k="global.close" />
				</a>
			</li>
			<li id="nav-menu-back" className="none" evt-click="back()">
				<a role="button" className="accesskey-B" data-sound="SE_WAVE_BACK" tabIndex={0}>
					<T k="global.go_back" />
				</a>
			</li>
		</menu>
	);
}
