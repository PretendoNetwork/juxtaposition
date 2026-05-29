import cx from 'classnames';
import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrButton } from '@/services/juxt-web/views/ctr/components/ui/CtrButton';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { PostScreenshotProps, PostViewProps } from '@/services/juxt-web/views/web/post';

function CtrPostScreenshot(props: PostScreenshotProps): ReactNode {
	const url = useUrl();
	const post = props.post;
	if (!post.screenshot) {
		return null;
	}

	if (post.screenshot.aspectRatio && post.screenshot.imageUrlThumbnail) {
		// modern type
		return (
			<img
				className={cx(
					'post-screenshot',
					`post-screenshot-${post.screenshot.aspectRatio}`
				)}
				src={url.cdn(post.screenshot.imageUrlThumbnail)}
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

export function CtrPostView(props: PostViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();

	const post = props.post;
	const hasYeahed = post.yeahsBy.some(v => v.pid === user.pid);
	// TODO implement moderator removed post logic

	return (
		<div
			id={`post-${post.id}`}
			className={cx('post', {
				reply: props.isReply,
				spoiler: post.isSpoiler
			})}
		>
			<CtrMiiIcon pid={post.author.pid} face_url={post.mii.imageUrl}></CtrMiiIcon>
			<div className="post-body-content">
				<div
					id={post.id}
					className={cx('post-body', {
						yeah: hasYeahed
					})}
				>
					<header>
						<span className="screen-name">{post.author.miiName}</span>
						{' '}
						<span className="timestamp">
							{'- '}
							{moment(post.createdAt).fromNow()}
						</span>
						{ post.topicTag
							? (
									<>
										<br />
										<a href={url.url('/topics', { topic_tag: post.topicTag })} data-pjax="#body">
											<span>
												<span className="sprite sp-tag inline-sprite"></span>
												<span className="tags">{post.topicTag}</span>
											</span>
										</a>
									</>
								)
							: null }
					</header>

					{ !props.isReply
						? (
								<a href={`/titles/${post.community.id}`} className="community-banner" data-pjax="#body">
									<span className="title-icon-container" data-pjax="#body">
										<img src={url.cdn(`/icons/${post.community.id}/32.png`)} className="title-icon" />
									</span>
									<span className="community-name">{post.community.name}</span>
								</a>
							)
						: null}

					{ post.isSpoiler
						? (
								<div className="spoiler-wrapper" id={`spoiler-${post.id}`}>
									<button data-post-id={post.id}><T k="post.show_spoiler" /></button>
								</div>
							)
						: null }

					<div className="post-content" data-href={!props.isReply ? `/posts/${post.id}` : undefined}>
						{post.body
							? (
									<p className="post-content-text">{post.body}</p>
								)
							: null}
						<CtrPostScreenshot post={post}></CtrPostScreenshot>
						{post.painting
							? (
									<img className="post-memo" src={url.cdn(`/paintings/${post.author.pid}/${post.id}.png`)} />
								)
							: null}
						{/* TODO add post.url back */}
					</div>

					<div className="post-buttons">
						<CtrButton type="small" sprite="sp-yeah" selected={hasYeahed} data-button-yeah-post={post.id} />
						{props.isReply && post.author.pid !== user.pid
							? (
									<CtrButton type="small" sprite="sp-flag" href={`/posts/${post.id}/report`} />
								)
							: null}
						<a href={`/posts/${post.id}`} className="to-permalink-button" data-pjax="#body">
							<span className="sprite sp-yeah-small inline-sprite"></span>
							<span className="yeah-count" id={`count-${post.id}`}>{post.stats.empathyCount}</span>
							{' '}
							{!props.isReply
								? (
										<>
											<span className="sprite sp-reply inline-sprite"></span>
											<span className="reply-count">{post.stats.replyCount}</span>
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
										count: <span className="feeling">{ post.yeahsBy.length }</span>
									}}
								/>
							</h6>
							<div className="yeah-list">
								{post.yeahsBy.slice(0, 10).map(({ pid }) => (
									<CtrMiiIcon pid={pid}></CtrMiiIcon>
								))}
							</div>
						</>
					)
				: null}
		</div>
	);
}
