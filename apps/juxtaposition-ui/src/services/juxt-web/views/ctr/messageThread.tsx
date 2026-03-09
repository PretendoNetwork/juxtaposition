import moment from 'moment';
import cx from 'classnames';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { MessageThreadItemProps, MessageThreadViewProps } from '@/services/juxt-web/views/web/messageThread';

function MessageThreadItem(props: MessageThreadItemProps): ReactNode {
	const url = useUrl();
	const user = useUser();
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
				'my-post': msg.pid === user.pid,
				'other-post': msg.pid !== user.pid
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
	const cache = useCache();

	if (!props.otherUser.pid) {
		throw new Error('Other PID is undefined');
	}
	if (!props.conversation.id) {
		throw new Error('Conversation does not have an ID');
	}
	const otherUserName = cache.getUserName(props.otherUser.pid) ?? '';

	return (
		<CtrRoot
			title={T.str('global.messages')}
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
						<T k="new_post.new_post_short" />
						{' +'}
					</a>
				</header>
				<div className="body-content message-post-list" id="message-page">
					{props.messages.map(msg => <MessageThreadItem key={msg.id} message={msg} />)}
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
