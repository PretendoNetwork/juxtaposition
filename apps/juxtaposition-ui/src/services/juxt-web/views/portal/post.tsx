import cx from 'classnames';
import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { PortalUIIcon } from '@/services/juxt-web/views/portal/components/ui/PortalUIIcon';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { PostScreenshotProps, PostViewProps } from '@/services/juxt-web/views/web/post';

function PortalPostScreenshot(props: PostScreenshotProps): ReactNode {
	const url = useUrl();

	const post = props.post;
	if (!post.screenshot) {
		return null;
	}

	if (post.screenshot.aspectRatio) {
		// modern type
		return (
			<img
				className={cx(
					'post-screenshot',
					`post-screenshot-${post.screenshot.aspectRatio}`
				)}
				src={url.cdn(post.screenshot.imageUrlBig ? post.screenshot.imageUrlBig : post.screenshot.imageUrl)}
			/>
		);
	} else {
		// legacy type
		return (
			<img
				className="post-screenshot"
				src={url.cdn(post.screenshot.imageUrl)}
			/>
		);
	}
}

export function PortalPostView(props: PostViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const post = props.post;
	const hasYeahed = post.yeahsBy.some(v => v.pid === user.pid);
	const isModerator = user.perms.moderator;
	// TODO implement moderator removed post logic

	const content = (
		<>
			<a href={url.url('/users/show', { pid: post.author.pid })} className="mii-icon-container" data-pjax="#body">
				<img src={post.mii.imageUrl ?? undefined} className="mii-icon" />
			</a>
			<div
				className={cx('post-body-content', {
					removed: !!post.moderation?.removed
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
							{post.author.miiName}
						</span>
						{' '}
						<span className="timestamp">
							{'- '}
							{moment(post.createdAt).fromNow()}
						</span>
						{post.topicTag
							? (
									<a href={url.url('/topics', { topic_tag: post.topicTag })} data-pjax="#body">
										{/* TODO this has been modified due to inbalanced tags */}
										<PortalUIIcon name="topic" />
										<span className="tags">{post.topicTag}</span>
									</a>
								)
							: null }
					</header>

					{ !props.isReply
						? (
								<a href={`/titles/${post.community.id}`} className="community-banner" data-pjax="#body">
									<span className="title-icon-container" data-pjax="#body">
										<img src={url.cdn(`/icons/${post.community.id}/64.png`)} className="title-icon" />
									</span>
									<span className="community-name">{post.community.name}</span>
								</a>
							)
						: null}

					{ post.isSpoiler
						? (
								<div className="spoiler-wrapper">
									<button data-post-id={post.id}><T k="post.show_spoiler" /></button>
								</div>
							)
						: null}

					<div
						className="post-content"
						data-href={!props.isReply ? `/posts/${post.id}` : undefined}
					>
						{post.body ? <p className="post-content-text">{post.body}</p> : null}
						<PortalPostScreenshot post={post}></PortalPostScreenshot>
						{post.painting ? <img className="post-memo" src={url.cdn(post.painting.imageUrlBig ? post.painting.imageUrlBig : `/paintings/${post.author.pid}/${post.id}.png`)} /> : null}
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
							{ props.isReply && post.author.pid !== user.pid && !isModerator
								? (
										<div>
											<button type="button" className="submit report" data-post={post.id} evt-click="reportPost(this)"></button>
										</div>
									)
								: null}
							{ props.isReply && (post.author.pid === user.pid || isModerator)
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
											<span className="feeling" id={`count-${post.id}`}>{post.stats.empathyCount}</span>
											{ !props.isReply
												? (
														<span className="reply">{post.stats.replyCount}</span>
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
			{ props.isMainPost && post.yeahsBy.length > 0
				? (
						<>

							<h6 className="yeah-text">
								<T
									k={post.yeahsBy.length === 1 ? 'post.yeahs_count/one' : 'post.yeahs_count/multiple'}
									components={{
										count: <span className="feeling" id={`count-${post.id}`}>{post.stats.empathyCount}</span>
									}}
								/>
							</h6>
							<div className="yeah-list">
								{post.yeahsBy.slice(0, 9).map(({ pid }) => (
									<a href={`/users/${pid}`} className="mii-icon-container" data-pjax="#body">
										<img src={url.cdn(`/mii/${pid}/normal_face.png`)} className="mii-icon" />
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
				spoiler: post.isSpoiler
			})}
		>
			{post.moderation?.removed
				? (
						<div className="post-body-content removed">
							<h2><T k="post.removed" /></h2>
						</div>
					)
				: content}
		</div>
	);
}
