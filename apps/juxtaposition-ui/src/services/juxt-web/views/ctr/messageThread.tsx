import moment from 'moment';
import cx from 'classnames';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { MessageThreadItemProps, MessageThreadViewProps } from '@/services/juxt-web/views/web/messageThread';
import type { ReactNode } from 'react';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';

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

// TODO include partials!
export function PortalMessageThreadView(props: MessageThreadViewProps): ReactNode {
	if (!props.otherUser.pid) {
		throw new Error('Other PID is undefined');
	}
	return (
		<CtrRoot title={props.ctx.lang.global.messages}>
			<CtrPageBody>
				<header id="header" className="buttons">
					<h1 id="page-title">{props.ctx.usersMap.get(props.otherUser.pid)}</h1>
					<a id="header-post-button" className="header-button left" href="#"
					data-sound="SE_WAVE_SELECT_TAB" data-module-hide="message-page"
					data-module-show="add-post-page" data-header="false" data-screenshot="true"
					data-message={`Message to ${props.ctx.usersMap.get(props.otherUser.pid)}`}>Post + </a>
				</header>
				<div className="body-content message-post-list" id="message-page">
					{props.messages.map(msg => <MessageThreadItem key={msg.id} ctx={props.ctx} message={msg} />)}
				</div>
				<%- include('partials/new_post', { pid, lang, id: conversation.id, name: userMap.get(user2.pid), url: '/friend_messages/new', show: 'message-page', message_pid: user2.pid  }); %>
				<img src="" onerror="cave.toolbar_setActiveButton(4);setTimeout(function() { window.scrollTo(0, 500000); }, 1000)"></img>
			</CtrPageBody>
		</CtrRoot>
	);
}


