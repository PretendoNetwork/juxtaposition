import moment from 'moment';
import cx from 'classnames';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot } from '@/services/juxt-web/views/web/root';
import { WebNewPostView } from '@/services/juxt-web/views/web/newPostView';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ConversationModel, ConversationUserModel } from '@/services/juxt-web/views/web/messages';
import type { PostSchema } from '@/models/post';

export type ConversationPost = InferSchemaType<typeof PostSchema>;

export type MessageThreadViewProps = {
	ctx: RenderContext;
	conversation: ConversationModel;
	otherUser: ConversationUserModel;
	messages: ConversationPost[];
};

export type MessageThreadItemProps = {
	ctx: RenderContext;
	message: ConversationPost;
};

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
				<img src={utils.cdn(props.ctx, `${msg.mii_face_url?.substring(msg.mii_face_url.lastIndexOf('/mii'))}`)} className="mii-icon" />
			</a>
			<div className="post-body">
				{screenshotContent}
				{content}
			</div>
			<footer>
				<span className="timestamp">{moment(props.message.created_at).fromNow() }</span>
			</footer>
		</div>
	);
}

export function WebMessageThreadView(props: MessageThreadViewProps): ReactNode {
	if (!props.otherUser.pid) {
		throw new Error('Other PID is undefined');
	}
	if (!props.conversation.id) {
		throw new Error('Conversation does not have an ID');
	}
	const otherUserName = props.ctx.usersMap.get(props.otherUser.pid) ?? '';

	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				{otherUserName}
			</h2>
			<WebNavBar ctx={props.ctx} selection={3} />
			<div id="toast" />
			<div id="wrapper">
				<div className="body-content message-post-list" id="message-page">
					<button id="header-post-button" className="header-button" data-module-hide="message-page" data-module-show="add-post-page" data-header="true" data-menu="true">+</button>
					{props.messages.map(msg => <MessageThreadItem key={msg.id} ctx={props.ctx} message={msg} />)}
				</div>
				<WebNewPostView ctx={props.ctx} id={props.conversation.id} name={otherUserName} url="/friend_messages/new" show="message-page" messagePid={props.otherUser.pid} />
				<div id="painting-wrapper" className="painting-wrapper" style={{ display: 'none' }}>
					<div id="painting-content">
						<div className="tools">
							<div>
								<button className="clear" evt-click="clearCanvas()"></button>
								<button className="undo"></button>
							</div>
							<div>
								<ul className="buttons pencil">
									<li>
										<input evt-click="setPen(0)" type="radio" defaultValue="0" className="pencil small" name="tool" defaultChecked />
									</li>
									<li>
										<input evt-click="setPen(1)" type="radio" defaultValue="1" className="pencil medium" name="tool" />
									</li>
									<li>
										<input evt-click="setPen(2)" type="radio" defaultValue="2" className="pencil large" name="tool" />
									</li>
								</ul>
								<ul className="buttons eraser">
									<li>
										<input evt-click="setEraser(0)" type="radio" defaultValue="0" className="eraser small" name="tool" />
									</li>
									<li>
										<input evt-click="setEraser(1)" type="radio" defaultValue="1" className="eraser medium" name="tool" />
									</li>
									<li>
										<input evt-click="setEraser(2)" type="radio" defaultValue="2" className="eraser large" name="tool" />
									</li>
								</ul>
							</div>
						</div>
						<canvas width="320" height="120" id="painting">Your browser does not support the HTML canvas tag.</canvas>
						<div id="button-wrapper">
							<button evt-click="closePainting(false)">Cancel</button>
							<button className="primary" evt-click="closePainting(true)">OK</button>
						</div>
					</div>
					<script src="/js/painting.global.js" />
				</div>
			</div>
			<img src="" evt-error="setTimeout(function() { window.scrollTo(0, 50000); }, 500)" />
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}
