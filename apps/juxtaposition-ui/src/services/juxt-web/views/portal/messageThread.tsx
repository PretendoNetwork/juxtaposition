import moment from 'moment';
import cx from 'classnames';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalNewPostView } from '@/services/juxt-web/views/portal/newPostView';
import { utils } from '@/services/juxt-web/views/utils';
import type { MessageThreadItemProps, MessageThreadViewProps } from '@/services/juxt-web/views/web/messageThread';
import type { ReactNode } from 'react';

function MessageThreadItem(props: MessageThreadItemProps): ReactNode {
	const msg = props.message;

	let screenshotContent: ReactNode = null;
	if (msg.screenshot) {
		screenshotContent = <img className="message-viewer-bubble-sent-screenshot" src={utils.cdn(props.ctx, msg.screenshot)} />;
	}

	let content = <p className="post-content">{ msg.body }</p>;
	if (msg.painting) {
		content = <img className="message-viewer-bubble-sent-memo" src={utils.cdn(props.ctx, `/paintings/${msg.pid}/${msg.id}.png`)} />;
	}

	return (
		<div
			id={`message-${msg.id}`}
			className={cx('post scroll', {
				'my-post': msg.pid === props.ctx.pid,
				'other-post': msg.pid !== props.ctx.pid
			})}
		>
			<a href={utils.url('/users/show', { pid: msg.pid })} data-pjax="#body" className="scroll-focus mii-icon-container">
				<img src={msg.mii_face_url?.replace('http:', 'https:')} className="mii-icon" />
			</a>
			<header>
				<span className="timestamp">{moment(msg.created_at).fromNow()}</span>
			</header>
			<div className="post-body">
				{screenshotContent}
				{content}
			</div>
		</div>
	);
}

export function PortalMessageThreadView(props: MessageThreadViewProps): ReactNode {
	if (!props.otherUser.pid) {
		throw new Error('Other PID is undefined');
	}
	if (!props.conversation.id) {
		throw new Error('Conversation does not have an ID');
	}
	const otherUserName = props.ctx.usersMap.get(props.otherUser.pid) ?? '';

	return (
		<PortalRoot title={props.ctx.lang.global.messages}>
			<PortalNavBar ctx={props.ctx} selection={3} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">{otherUserName}</h1>
					<a id="header-post-button" className="header-button" href="#" data-module-hide="message-page" data-module-show="add-post-page" data-header="false" data-menu="false">Post</a>
				</header>
				<div className="body-content message-post-list" id="message-page">
					{props.messages.map(msg => <MessageThreadItem key={msg.id} ctx={props.ctx} message={msg} />)}
				</div>
				<PortalNewPostView ctx={props.ctx} id={props.conversation.id} name={otherUserName} url="/friend_messages/new" show="message-page" messagePid={props.otherUser.pid} />
				<img src="" evt-error="setTimeout(function() { window.scrollTo(0, 50000); }, 500)" />
			</PortalPageBody>
		</PortalRoot>
	);
}
