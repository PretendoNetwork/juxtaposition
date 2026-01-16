import { utils } from '@/services/juxt-web/views/utils';
import { JuxtLogo } from '@/services/juxt-web/views/web/icons';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type NavBarProps = {
	ctx: RenderContext;
	selection: number;
};

export function WebNavBar(props: NavBarProps): ReactNode {
	const selectedClasses = (id: number): string =>
		id === props.selection ? 'selected' : '';

	// TODO replace SVG icons with better methods for inline SVG (raw imports / Icon component)
	return (
		<header id="nav-menu">
			<a href="/" className="logo-link">
				<JuxtLogo />
			</a>
			{props.ctx.pid !== 1000000000
				? (
						<>
							<a href="/users/me" className={selectedClasses(0)}>
								<img
									className="mii-icon"
									src={utils.cdn(props.ctx, `/mii/${props.ctx.pid}/normal_face.png`)}
									alt="User Page"
								/>
								<p>{props.ctx.lang.global.user_page}</p>
							</a>
							<a href="/feed" className={selectedClasses(1)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#A1A8D9"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="feather feather-home"
								>
									<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
									<polyline points="9 22 9 12 15 12 15 22" />
								</svg>
								<p>{props.ctx.lang.global.activity_feed}</p>
							</a>
							<a href="/titles" className={selectedClasses(2)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#A1A8D9"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="feather feather-users"
								>
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="9" cy="7" r="4" />
									<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
									<path d="M16 3.13a4 4 0 0 1 0 7.75" />
								</svg>
								<p>{props.ctx.lang.global.communities}</p>
							</a>
							<a href="/friend_messages" className={selectedClasses(3)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#A1A8D9"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="feather feather-mail"
								>
									<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
									<polyline points="22,6 12,13 2,6" />
								</svg>
								<span id="message-badge" className="badge"></span>
								<p>{props.ctx.lang.global.messages}</p>
							</a>
							<a href="/news/my_news" className={selectedClasses(4)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="40"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#A1A8D9"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="feather feather-bell"
								>
									<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
									<path d="M13.73 21a2 2 0 0 1-3.46 0" />
								</svg>
								<span id="news-badge" className="badge"></span>
								<p>{props.ctx.lang.global.notifications}</p>
							</a>
							{props.ctx.moderator
								? (
										<>
											<a href="/admin/posts" className={selectedClasses(5)}>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 256 256"
													width="40"
													height="48"
												>
													<rect
														x="50.75"
														y="44.69"
														width="106.51"
														height="38.63"
														rx="8"
														transform="translate(-14.79 92.28) rotate(-45)"
														fill="none"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="16"
													/>
													<rect
														x="138.75"
														y="132.69"
														width="106.51"
														height="38.63"
														rx="8"
														transform="translate(-51.24 180.28) rotate(-45)"
														fill="none"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="16"
													/>
													<line
														x1="145.66"
														y1="49.66"
														x2="206.34"
														y2="110.34"
														fill="none"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="16"
													/>
													<line
														x1="89.66"
														y1="105.66"
														x2="150.34"
														y2="166.34"
														fill="none"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="16"
													/>
													<path
														d="M132,148,61,219a17,17,0,0,1-24,0h0a17,17,0,0,1,0-24l71-71"
														fill="none"
														stroke="currentColor"
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="16"
													/>
												</svg>
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
