import cx from 'classnames';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { humanFromNow } from '@/util';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type {
	ConversationUserModel,
	MessagesViewProps
} from '@/services/juxt-web/views/web/messages';

export function CtrMessagesView(props: MessagesViewProps): ReactNode {
	const cache = useCache();
	const user = useUser();

	return (
		<ul
			className="list-content-with-icon-column arrow-list"
			id="news-list-content"
		>
			{props.conversations.length === 0
				? (
						<p className="no-posts-text"><T k="messages.coming_soon" /></p>
					)
				: (
						props.conversations.map((convo) => {
							let userObj: ConversationUserModel | null = null;
							let me: ConversationUserModel | null = null;
							if (convo.users[0].pid === user.pid) {
								userObj = convo.users[1];
								me = convo.users[0];
							} else if (convo.users[1].pid === user.pid) {
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
										type="icon"
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
												{cache.getUserName(userObj.pid)}
											</span>
											<span className="id-name">
												{' @'}
												{cache.getUserName(userObj.pid)}
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
