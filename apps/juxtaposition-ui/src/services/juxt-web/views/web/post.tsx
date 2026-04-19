import cx from 'classnames';
import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { Post, SelfContent } from '@/api/generated';

export type PostScreenshotProps = {
	post: Post;
};

export function WebPostScreenshot(props: PostScreenshotProps): ReactNode {
	const url = useUrl();
	const post = props.post;
	if (!post.screenshot) {
		return <></>;
	}

	return <img id={post.id ?? undefined} className="screenshot" src={url.cdn(post.screenshot)} />;
}

export type PostViewProps = {
	userContent?: SelfContent | null;
	post: Post;
	isReply?: boolean;
	isMainPost?: boolean;
};

export function WebPostView(props: PostViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const post = props.post;
	const isModerator = user.perms.moderator;
	const canAccessContent = !post.removed || isModerator;

	const yeahed = !!props.userContent && !!post.yeahs && post.yeahs.includes(user.pid);

	let removedPostPart = null;
	if (post.removed) {
		removedPostPart = (
			<div className="post-body-content removed">
				<h3><T k="post.removed" /></h3>
			</div>
		);
	}

	const contentPart = (
		<>
			<div className="post-user-info-wrapper" id={post.id ?? undefined}>
				<a href={url.url('/users/show', { pid: post.pid })}>
					<img
						className={cx('user-icon', {
							verified: post.verified
						})}
						src={post.mii_face_url ?? undefined}
					/>
				</a>

				<div className="post-meta-wrapper">
					<h3>
						<a href={url.url('/users/show', { pid: post.pid })}>{post.screen_name}</a>
					</h3>

					{ post.verified
						? (
								<span className="verified-badge">✓</span>
							)
						: null}

					<h4>
						<a href={`/posts/${post.id}`}>{moment(post.created_at).fromNow()}</a>
						{' - '}
						<a href={`/titles/${post.community_id}`}>{post.community.name}</a>
					</h4>
				</div>
			</div>
			{ post.is_spoiler
				? (
						<div className="spoiler-overlay">
							<button evt-click={`this.parentElement.style.display = 'none'; document.getElementById('post-content-${post.id}').style.display = 'block'`}>
								<T k="post.show_spoiler" />
							</button>
						</div>
					)
				: null}

			<div
				className="post-content"
				id={`post-content-${post.id}`}
				style={{
					display: post.is_spoiler ? 'none' : undefined // Will be removed by spoiler-overlay onclick
				}}
				evt-click={`location.href='/posts/${post.id}'`}
			>
				{post.body !== '' ? <h4>{post.body}</h4> : null}
				<WebPostScreenshot post={props.post}></WebPostScreenshot>
				{post.painting !== '' ? <img id={post.id ?? undefined} className="painting" src={url.cdn(`/paintings/${post.pid}/${post.id}.png`)} /> : null}
				{/* TODO add post.url back */}
			</div>

			<div className="post-buttons-wrapper">
				{/* Heart/Empathy button */}
				<span
					data-button-yeah-post={post.id}
					className={cx('post-button', 'empathy-button', {
						selected: yeahed
					})}
					role="button"
					aria-pressed={yeahed}
				>
					<WebUIIcon name="heart" />
					<h4 id={`count-${post.id}`}>{post.empathy_count}</h4>
				</span>

				{/* Reply "button" */}
				<a
					href={`/posts/${post.id}`}
					className="post-button reply-button"
					role="button"
				>
					<WebUIIcon name="reply" />
					<h4>{post.reply_count}</h4>
				</a>

				{/* Hamburger menu */}
				<span className="post-button post-hamburger-button" aria-haspopup="menu" aria-expanded="false">
					<WebUIIcon name="menu" />
					<ul className="post-hamburger" role="menu" data-post={post.id}>
						<li role="menuitem" data-action="report">
							<WebUIIcon name="flag" />
							{' '}
							<T k="post.report_post" />
						</li>
						{ isModerator || post.pid === user.pid
							? (
									<li role="menuitem" data-action="delete" data-moderator={isModerator}>
										<WebUIIcon name="bin" />
										{' '}
										{isModerator ? <T k="moderation.silently_delete_post" /> : <T k="post.delete_post" />}
									</li>
								)
							: null}
						<li role="menuitem" data-action="copy">
							<WebUIIcon name="share" />
							{' '}
							<T k="post.copy_link" />
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
