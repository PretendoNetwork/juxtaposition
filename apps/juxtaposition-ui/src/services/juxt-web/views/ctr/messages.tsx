import cx from 'classnames';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/mii-icon';
import { humanFromNow } from '@/util';
import type { ReactNode } from 'react';
import type {
	ConversationUserModel,
	MessagesViewProps
} from '@/services/juxt-web/views/web/messages';

export function CtrMessagesView(props: MessagesViewProps): ReactNode {
	return (
		<ul
			className="list-content-with-icon-column arrow-list"
			id="news-list-content"
		>
			{props.conversations.length === 0
				? (
						<p className="no-posts-text">{props.ctx.lang.messages.coming_soon}</p>
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
									<CtrMiiIcon
										pid={userObj.pid}
										big={true}
										className={cx({ verified: userObj.official })}
									>
									</CtrMiiIcon>
									<a
										href={`/friend_messages/${convo.id}`}
										data-pjax="#body"
										className="arrow-button"
									>
									</a>
									<div className="body message">
										<p>
											<span className="nick-name">
												{props.ctx.usersMap.get(userObj.pid)}
											</span>
											<span className="id-name">
												{' @'}
												{props.ctx.usersMap.get(userObj.pid)}
											</span>
											<span>
												{' '}
												{convo.message_preview}
											</span>
											<span className="timestamp">
												{' '}
												{humanFromNow(convo.last_updated)}
											</span>
										</p>
									</div>
								</li>
							);
						})
					)}
		</ul>
	);
}
