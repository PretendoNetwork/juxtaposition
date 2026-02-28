import moment from 'moment';
import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { utils } from '@/services/juxt-web/views/utils';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import type { ReactNode } from 'react';
import type { MessageThreadItemProps, MessageThreadViewProps } from '@/services/juxt-web/views/web/messageThread';

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
			<CtrMiiIcon ctx={props.ctx} pid={msg.pid ?? 0} face_url={msg.mii_face_url ?? undefined}></CtrMiiIcon>
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

export function CtrMessageThreadView(props: MessageThreadViewProps): ReactNode {
	if (!props.otherUser.pid) {
		throw new Error('Other PID is undefined');
	}
	if (!props.conversation.id) {
		throw new Error('Conversation does not have an ID');
	}
	const otherUserName = props.ctx.usersMap.get(props.otherUser.pid) ?? '';

	return (
		<CtrRoot
			ctx={props.ctx}
			title={props.ctx.lang.global.messages}
			onLoad="window.scrollTo(0, 500000);"
			data-toolbar-mode="normal"
			data-toolbar-active-button="4"
		>
			<CtrPageBody>
				<header id="header" className="buttons">
					<h1 id="page-title">{otherUserName}</h1>
					<a
						id="header-post-button"
						className="header-button left"
						href={`/friend_messages/${props.conversation.id}/create`}
						data-pjax="#body"
					>
						Post +
					</a>
				</header>
				<div className="body-content message-post-list" id="message-page">
					{props.messages.map(msg => <MessageThreadItem key={msg.id} ctx={props.ctx} message={msg} />)}
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
