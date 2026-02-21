import moment from 'moment';
import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrNewPostView } from '@/services/juxt-web/views/ctr/newPostView';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/mii-icon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { MessageThreadItemProps, MessageThreadViewProps } from '@/services/juxt-web/views/web/messageThread';

function MessageThreadItem(props: MessageThreadItemProps): ReactNode {
	const url = useUrl();
	const msg = props.message;

	let screenshotContent: ReactNode = null;
	if (msg.screenshot) {
		screenshotContent = <img className="message-viewer-bubble-sent-screenshot" src={url.cdn(msg.screenshot)} />;
	}

	let content = <p className="post-content">{ msg.body }</p>;
	if (msg.painting) {
		content = <img className="message-viewer-bubble-sent-memo" src={url.cdn(`/paintings/${msg.pid}/${msg.id}.png`)} />;
	}

	return (
		<div
			id={`message-${msg.id}`}
			className={cx('post scroll', {
				'my-post': msg.pid === props.ctx.pid,
				'other-post': msg.pid !== props.ctx.pid
			})}
		>
			<CtrMiiIcon pid={msg.pid ?? 0} face_url={msg.mii_face_url ?? undefined}></CtrMiiIcon>
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
		<CtrRoot title={props.ctx.lang.global.messages} onLoad="cave.toolbar_setActiveButton(4);window.scrollTo(0, 500000);">
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
					{props.messages.map(msg => <MessageThreadItem key={msg.id} message={msg} />)}
				</div>
				<CtrNewPostView id={props.conversation.id} name={otherUserName} url="/friend_messages/new" show="message-page" messagePid={props.otherUser.pid} />
			</CtrPageBody>
		</CtrRoot>
	);
}
