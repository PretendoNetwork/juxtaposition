import moment from 'moment';
import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrNewPostView } from '@/services/juxt-web/views/ctr/newPostView';
import type { MessageThreadItemProps, MessageThreadViewProps } from '@/services/juxt-web/views/web/messageThread';
import type { ReactNode } from 'react';

function MessageThreadItem(props: MessageThreadItemProps): ReactNode {
	const msg = props.message;
	let content = <p className="post-content">{ msg.body }</p>;
	if (msg.screenshot) {
		content = <img className="message-viewer-bubble-sent-screenshot" src={`${props.ctx.cdnUrl}${msg.screenshot}`} />;
	} else if (msg.painting) {
		content = <img className="message-viewer-bubble-sent-memo" src={`${props.ctx.cdnUrl}/paintings/${msg.pid}/${msg.id}.png`} />;
	}

	return (
		<div
			id={`message-${msg.id}`}
			className={cx('post scroll', {
				'my-post': msg.pid === props.ctx.pid,
				'other-post': msg.pid !== props.ctx.pid
			})}
		>
			<a href={`/users/show?pid=${msg.pid}`} data-pjax="#body" className="scroll-focus mii-icon-container">
				<img src={msg.mii_face_url?.replace('http:', 'https:')} className="mii-icon" />
			</a>
			<header>
				<span className="timestamp">{moment(msg.created_at).fromNow()}</span>
			</header>
			<div className="post-body">
				{content}
			</div>
		</div>
	);
}

export function CtrMessageThreadView(props: MessageThreadViewProps): ReactNode {
	if (!props.otherUser.pid) {
		throw new Error('Other PID is undefined');
	}
	if (!props.conversation.id) {
		throw new Error('Conversation does not have an ID');
	}
	const otherUserName = props.ctx.usersMap.get(props.otherUser.pid) ?? '';

	return (
		<CtrRoot title={props.ctx.lang.global.messages}>
			<CtrPageBody>
				<header id="header" className="buttons">
					<h1 id="page-title">{otherUserName}</h1>
					<a
						id="header-post-button"
						className="header-button left"
						href="#"
						data-sound="SE_WAVE_SELECT_TAB"
						data-module-hide="message-page"
						data-module-show="add-post-page"
						data-header="false"
						data-screenshot="true"
						data-message={`Message to ${otherUserName}`}
					>
						Post +
					</a>
				</header>
				<div className="body-content message-post-list" id="message-page">
					{props.messages.map(msg => <MessageThreadItem key={msg.id} ctx={props.ctx} message={msg} />)}
				</div>
				<CtrNewPostView ctx={props.ctx} id={props.conversation.id} name={otherUserName} url="/friend_messages/new" show="message-page" messagePid={props.otherUser.pid} />
				<img src="" evt-error="cave.toolbar_setActiveButton(4);setTimeout(function() { window.scrollTo(0, 500000); }, 1000)" />
			</CtrPageBody>
		</CtrRoot>
	);
}
