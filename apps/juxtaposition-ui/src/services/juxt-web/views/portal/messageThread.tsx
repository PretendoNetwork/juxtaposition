import moment from 'moment';
import cx from 'classnames';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
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
			<a href={url.url('/users/show', { pid: msg.pid })} data-pjax="#body" className="scroll-focus mii-icon-container">
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
	const cache = useCache();
	const otherUserName = cache.getUserName(props.otherUser.pid) ?? '';
	const postable = !props.readonly;

	return (
		<PortalRoot title={T.str('global.messages')} onLoad="window.scrollTo(0, 50000);">
			<PortalNavBar selection={3} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title">{otherUserName}</h1>
					{postable
						? (
								<a
									id="header-post-button"
									className="header-button"
									href={`/friend_messages/${props.conversation.id}/create`}
									data-pjax="#body"
								>
									<T k="new_post.new_post_short" />
								</a>
							)
						: null}
				</header>
				<div className="body-content message-post-list" id="message-page">
					{props.messages.map(msg => <MessageThreadItem key={msg.id} message={msg} />)}
					{ props.banner
						? (
								<p>
									<T
										k="dmBannerText"
										components={{
											url: <span>...</span>
										}}
									/>
								</p>
							)
						: null }
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
