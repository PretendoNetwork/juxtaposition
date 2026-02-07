import cx from 'classnames';
import moment from 'moment';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import {
	PortalPageBody,
	PortalRoot
} from '@/services/juxt-web/views/portal/root';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type {
	ConversationUserModel,
	MessagesViewProps
} from '@/services/juxt-web/views/web/messages';

export function PortalMessagesView(props: MessagesViewProps): ReactNode {
	return (
		<PortalRoot ctx={props.ctx} title={props.ctx.lang.global.messages}>
			<PortalNavBar ctx={props.ctx} selection={3} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">{props.ctx.lang.global.messages}</h1>
				</header>
				<div className="body-content" id="messages-list">
					<ul className="list-content-with-icon-and-text arrow-list">
						{props.conversations.length === 0
							? (
									<p className="no-posts-text">
										{props.ctx.lang.messages.coming_soon}
									</p>
								)
							: (
									props.conversations.map((convo) => {
										let userObj: ConversationUserModel | null = null;
										let me: ConversationUserModel | null = null;
										if (convo.users[0].pid === props.ctx.pid) {
											userObj = convo.users[1];
											me = convo.users[0];
										} else if (convo.users[1].pid === props.ctx.pid) {
											userObj = convo.users[0];
											me = convo.users[1];
										}
										if (!me || !userObj) {
											return null;
										}
										if (!userObj.pid || !me.pid) {
											return null;
										} // Prevent rendering with incomplete data
										return (
											<li key={convo.id}>
												<a
													href={utils.url('/users/show', { pid: userObj.pid })}
													data-pjax="#body"
													className="icon-container trigger"
												>
													<img
														src={utils.cdn(props.ctx, `/mii/${userObj.pid}/normal_face.png`)}
														className={cx('icon', {
															verified: userObj.official
														})}
													/>
												</a>
												<a
													href={`/friend_messages/${convo.id}`}
													data-pjax="#body"
													className="arrow-button"
												>
												</a>
												<div className="body">
													<p className="title">
														<span className="nick-name">
															{props.ctx.usersMap.get(userObj.pid)}
														</span>
														<span className="id-name">
															@
															{props.ctx.usersMap.get(userObj.pid)}
														</span>
													</p>
													<span className="timestamp">
														{moment(convo.last_updated).fromNow()}
													</span>
													<p className="text">{convo.message_preview}</p>
												</div>
											</li>
										);
									})
								)}
					</ul>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
