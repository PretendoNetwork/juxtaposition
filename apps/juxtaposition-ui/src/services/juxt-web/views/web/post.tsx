import cx from 'classnames';
import moment from 'moment';
import { utils } from '@/services/juxt-web/views/utils';
import { WebIcon } from '@/services/juxt-web/views/web/icons';
import type { InferSchemaType } from 'mongoose';
import type { ReactNode } from 'react';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type PostViewProps = {
	ctx: RenderContext;
	userContent: InferSchemaType<typeof ContentSchema>;
	post: InferSchemaType<typeof PostSchema>;
	isReply?: boolean;
	isMainPost?: boolean;
};

export function WebPostView(props: PostViewProps): ReactNode {
	const post = props.post;
	const isModerator = props.ctx.moderator;
	const canAccessContent = !post.removed || isModerator;

	let removedPostPart = null;
	if (post.removed) {
		removedPostPart = (
			<div className="post-body-content removed">
				<h3>Post has been removed.</h3>
			</div>
		);
	}

	const contentPart = (
		<>
			<div className="post-user-info-wrapper" id={post.id ?? undefined}>
				<img
					className={cx('user-icon', {
						verified: post.verified
					})}
					src={post.mii_face_url ?? undefined}
					data-pjax={utils.url('/users/show', { pid: post.pid })}
				/>

				<div className="post-meta-wrapper">
					<h3>
						<a href={utils.url('/users/show', { pid: post.pid })}>{post.screen_name}</a>
					</h3>

					{ post.verified
						? (
								<span className="verified-badge">✓</span>
							)
						: null}

					<h4>
						{moment(post.created_at).fromNow()}
						{' - '}
						<a href={`/titles/${post.community_id}`}>{props.ctx.communityMap.get(post.community_id ?? '')}</a>
					</h4>
				</div>
			</div>
			{ post.is_spoiler
				? (
						<div className="spoiler-overlay">
							<button evt-click={`this.parentElement.style.display = 'none'; document.getElementById('post-content-${post.id}').style.display = 'block'`}>Click to Show Spoiler</button>
						</div>
					)
				: null}

			<div
				className="post-content"
				id={`post-content-${post.id}`}
				style={{
					display: post.is_spoiler ? 'none' : undefined // Will be removed by spoiler-overlay onclick
				}}
				evt-click={`location.href='/posts/${post.id}`}
			>
				{post.body !== '' ? <h4>{post.body}</h4> : null}
				{post.screenshot && post.screenshot !== '' ? <img id={post.id ?? undefined} className="screenshot" src={utils.cdn(props.ctx, post.screenshot)} /> : null}
				{post.painting !== '' ? <img id={post.id ?? undefined} className="painting" src={utils.cdn(props.ctx, `/paintings/${post.pid}/${post.id}.png`)} /> : null}
				{/* TODO add post.url back */}
			</div>

			<div className="post-buttons-wrapper">
				{/* Heart/Empathy button */}
				<span
					data-post={post.id}
					className={cx('empathy-button', {
						selected: props.userContent && post.yeahs && post.yeahs.includes(props.ctx.pid)
					})}
				>

					<WebIcon name="heart" />
					<h4 id={`count-${post.id}`}>{post.empathy_count}</h4>
				</span>

				{/* Reply "button" */}
				<span className="reply-button">
					<WebIcon name="reply" />
					<h4>{post.reply_count}</h4>
				</span>

				{/* Hamburger menu */}
				<span className="post-hamburger-button" aria-haspopup="menu" aria-expanded="false">
					<WebIcon name="menu" />
					<ul className="post-hamburger" role="menu" data-post={post.id}>
						<li role="menuitem" data-action="report">
							<WebIcon name="flag" />
							{' '}
							Report Post
						</li>
						{ isModerator
							? (
									<li role="menuitem" data-action="delete" data-moderator>
										<WebIcon name="bin" />
										{' '}
										Delete Post
									</li>
								)
							: null}
						<li role="menuitem" data-action="copy">
							<WebIcon name="share" />
							{' '}
							Copy link
						</li>
					</ul>
				</span>
			</div>
		</>
	);

	return (
		<div className="posts-wrapper" id={post.id ?? undefined}>
			{removedPostPart}
			{canAccessContent ? contentPart : null}
		</div>
	);
}
