import cx from 'classnames';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { CtrButton } from '@/services/juxt-web/views/ctr/components/ui/CtrButton';
import { T } from '@/services/juxt-web/views/common/components/T';
import { humanFromNow } from '@/util';
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
			<div className="post-banner">
				<CtrMiiIcon pid={post.author.pid} face_url={post.mii.imageUrl} />
				<div className="sprite sp-speech-bubble" />
				<div className="text">
					<a className="screen-name" href={`/users/${post.author.pid}`} data-pjax="#body">{post.author.miiName}</a>
					{ !props.isReply
						? <a className="community" href={`/titles/${post.community?.olive_community_id}`} data-pjax="#body">{post.community?.name}</a>
						: null}
					{ post.topicTag
						? (
								<a className="topic-tag" href={url.url('/topics', { topic_tag: post.topicTag })} data-pjax="#body">
									<span className="sprite sp-tag inline-sprite"></span>
									{' '}
									<span>{post.topicTag}</span>
								</a>
							)
						: null}
				</div>
			</div>

			<div
				id={post.id}
				className={cx('post-body', {
					yeah: hasYeahed
				})}
			>
				{ post.isSpoiler
					? (
							<div className="spoiler-wrapper" id={`spoiler-${post.id}`}>
								<button className="show-spoiler" data-post-id={post.id}><T k="post.show_spoiler" /></button>
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
					<div className="post-buttons-box">
						<CtrButton type="post-action" sprite="sp-heart" selected={hasYeahed} data-button-yeah-post={post.id} />
						<span className="caption yeah-count" id={`count-${post.id}`}>{post.stats.empathyCount}</span>
						{props.isReply && post.author.pid !== user.pid
							? (
									<CtrButton type="post-action" sprite="sp-flag" href={`/posts/${post.id}/report`} />
								)
							: null}

						{!props.isReply
							? (
									<>
										<CtrButton type="post-action" sprite="sp-comments" href={`/posts/${post.id}`} />
										<span className="caption reply-count">{post.stats.replyCount}</span>
									</>
								)
							: null}

						<div className="flex-spacer"></div>
						<a className="timestamp" href={`/posts/${post.id}`} data-pjax="#body">{humanFromNow(post.createdAt, 'short')}</a>
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
									<>
										<CtrMiiIcon pid={pid} type="yeah-list-icon"></CtrMiiIcon>
									</>
								))}
							</div>
						</>
					)
				: null}
		</div>
	);
}
