import { JuxtLogo, WebIcon } from '@/services/juxt-web/views/web/icons';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import type { ReactNode } from 'react';

export type NavBarProps = {
	selection: number;
};

export function WebNavBar(props: NavBarProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const selectedClasses = (id: number): string =>
		id === props.selection ? 'selected' : '';

	return (
		<header id="nav-menu">
			<a href="/" className="logo-link">
				<JuxtLogo />
			</a>
			{user.pid !== 1000000000
				? (
						<>
							<a href="/users/me" className={selectedClasses(0)}>
								<img
									className="mii-icon"
									src={url.cdn(`/mii/${user.pid}/normal_face.png`)}
									alt="User Page"
								/>
								<p>{props.ctx.lang.global.user_page}</p>
							</a>
							<a href="/feed" className={selectedClasses(1)}>
								<WebIcon name="home" />
								<p>{props.ctx.lang.global.activity_feed}</p>
							</a>
							<a href="/titles" className={selectedClasses(2)}>
								<WebIcon name="users" />
								<p>{props.ctx.lang.global.communities}</p>
							</a>
							<a href="/friend_messages" className={selectedClasses(3)}>
								<WebIcon name="mail" />
								<span id="message-badge" className="badge"></span>
								<p>{props.ctx.lang.global.messages}</p>
							</a>
							<a href="/news/my_news" className={selectedClasses(4)}>
								<WebIcon name="bell" />
								<span id="news-badge" className="badge"></span>
								<p>{props.ctx.lang.global.notifications}</p>
							</a>
							{user.perms.moderator
								? (
										<>
											<a href="/admin/posts" className={selectedClasses(5)}>
												<WebIcon name="hammer" />
												<span id="news-badge" className="badge"></span>
												<p>Moderation</p>
											</a>
										</>
									)
								: null}
						</>
					)
				: null}
		</header>
	);
}
