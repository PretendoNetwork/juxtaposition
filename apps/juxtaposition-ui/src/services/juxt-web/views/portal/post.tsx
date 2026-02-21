import cx from 'classnames';
import moment from 'moment';
import { PortalIcon } from '@/services/juxt-web/views/portal/icons';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { PostScreenshotProps, PostViewProps } from '@/services/juxt-web/views/web/post';

function PortalPostScreenshot(props: PostScreenshotProps): ReactNode {
	const post = props.post;
	if (!post.screenshot) {
		return <></>;
	}

	if (post.screenshot_aspect) {
		// modern type
		return (
			<img
				className={cx(
					'post-screenshot',
					`post-screenshot-${post.screenshot_aspect}`
				)}
				src={url.cdn(post.screenshot)}
			/>
		);
	} else {
		// legacy type
		return (
			<img
				className="post-screenshot"
				src={url.cdn(post.screenshot)}
			/>
		);
	}
}

export function PortalPostView(props: PostViewProps): ReactNode {
	const url = useUrl();
	const post = props.post;
	const hasYeahed = post.yeahs && post.yeahs.indexOf(props.ctx.pid) !== -1;
	const isModerator = props.ctx.moderator;
	// TODO implement moderator removed post logic

	const content = (
		<>
			<a href={url.url('/users/show', { pid: post.pid })} className="mii-icon-container" data-pjax="#body">
				<img src={post.mii_face_url ?? undefined} className="mii-icon" />
			</a>
			<div
				className={cx('post-body-content', {
					removed: post.removed
				})}
			>
				<div
					className={cx('post-body', {
						yeah: hasYeahed
					})}
					id={post.id ?? undefined}
				>
					<header>
						<span className="screen-name">
							{post.screen_name}
						</span>
						{' '}
						<span className="timestamp">
							{'- '}
							{moment(post.created_at).fromNow()}
						</span>
						{post.topic_tag
							? (
									<a href={url.url('/topics', { topic_tag: post.topic_tag })} data-pjax="#body">
										{/* TODO this has been modified due to inbalanced tags */}
										<PortalIcon name="topic" />
										<span className="tags">{post.topic_tag}</span>
									</a>
								)
							: null }
					</header>

					{ !props.isReply
						? (
								<a href={`/titles/${post.community_id}`} className="community-banner" data-pjax="#body">
									<span className="title-icon-container" data-pjax="#body">
										<img src={url.cdn(`/icons/${post.community_id}/32.png`)} className="title-icon" />
									</span>
									<span className="community-name">{props.ctx.communityMap.get(post.community_id ?? '')}</span>
								</a>
							)
						: null}

					{ post.is_spoiler
						? (
								<div className="spoiler-wrapper">
									<button data-post-id={post.id}>Show Spoiler</button>
								</div>
							)
						: null}

					<div
						className="post-content"
						data-href={!props.isReply ? `/posts/${post.id}` : undefined}
					>
						{post.body !== '' ? <p className="post-content-text">{post.body}</p> : null}
						<PortalPostScreenshot ctx={props.ctx} post={post}></PortalPostScreenshot>
						{post.painting !== '' ? <img className="post-memo" src={url.cdn(`/paintings/${post.pid}/${post.id}.png`)} /> : null}
						{/* TODO add post.url back */}
					</div>

					<div className="post-buttons">
						<button
							type="button"
							className={cx('submit yeah-button', {
								selected: hasYeahed
							})}
							data-post={post.id}
						>
						</button>
						{' '}
						<a href={!props.isReply ? `/posts/${post.id}` : undefined} className="to-permalink-button" data-pjax="#body">
							{ props.isReply && post.pid !== props.ctx.pid && !isModerator
								? (
										<div>
											<button type="button" className="submit report" data-post={post.id} evt-click="reportPost(this)"></button>
										</div>
									)
								: null}
							{ props.isReply && (post.pid === props.ctx.pid || isModerator)
								? (
										<div>
											<button type="button" className="submit remove" data-button-delete-post={post.id}></button>
										</div>
									)
								: null}
							{ !props.isMainPost
								? (
										<>
											{' '}
											<span className="feeling" id={`count-${post.id}`}>{post.empathy_count}</span>
											{ !props.isReply
												? (
														<span className="reply">{post.reply_count}</span>
													)
												: null}
											{' '}
										</>
									)
								: null}
						</a>
					</div>
				</div>
			</div>
			{ props.isMainPost && post.yeahs.length > 0
				? (
						<>

							<h6 className="yeah-text">
								<span className="feeling" id={`count-${post.id}`}>{post.empathy_count}</span>
								{' '}
								people gave this post a yeah.
							</h6>
							<div className="yeah-list">
								{post.yeahs.slice(0, 9).map(yeah => (
									<a href={`/users/${yeah}`} className="mii-icon-container" data-pjax="#body">
										<img src={url.cdn(`/mii/${yeah}/normal_face.png`)} className="mii-icon" />
									</a>
								))}
							</div>
						</>
					)
				: null}
		</>
	);

	return (
		<div
			id={`post-${post.id}`}
			className={cx('post', {
				reply: props.isReply,
				spoiler: post.is_spoiler
			})}
		>
			{post.removed
				? (
						<div className="post-body-content removed">
							<h2>Post has been removed.</h2>
						</div>
					)
				: content}
		</div>
	);
}
