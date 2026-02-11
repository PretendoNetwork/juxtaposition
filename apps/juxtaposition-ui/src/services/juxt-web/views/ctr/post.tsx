import cx from 'classnames';
import moment from 'moment';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { PostViewProps } from '@/services/juxt-web/views/web/post';

export function CtrPostView(props: PostViewProps): ReactNode {
	const post = props.post;
	const hasYeahed = post.yeahs && post.yeahs.indexOf(props.ctx.pid) !== -1;
	// TODO implement moderator removed post logic

	return (
		<div
			id={`post-${post.id}`}
			className={cx('post', {
				reply: props.isReply,
				spoiler: post.is_spoiler
			})}
		>
			<a href={utils.url('/users/show', { pid: post.pid })} className="mii-icon-container" data-pjax="#body">
				<img src={post.mii_face_url ?? undefined} className="mii-icon" />
			</a>
			<div className="post-body-content">
				<div
					id={post.id ?? undefined}
					className={cx('post-body', {
						yeah: hasYeahed
					})}
				>
					<header>
						<span className="screen-name">{post.screen_name}</span>
						{' '}
						<span className="timestamp">
							{'- '}
							{moment(post.created_at).fromNow()}
						</span>
						{ post.topic_tag
							? (
									<a href={utils.url('/topics', { topic_tag: post.topic_tag })} data-pjax="#body">
										<span>
											<span className="sprite sp-tag inline-sprite"></span>
											<span className="tags">{post.topic_tag}</span>
										</span>
									</a>
								)
							: null }
					</header>

					{ !props.isReply
						? (
								<a href={`/titles/${post.community_id}`} className="community-banner" data-pjax="#body">
									<span className="title-icon-container" data-pjax="#body">
										<img src={utils.cdn(props.ctx, `/icons/${post.community_id}/32.png`)} className="title-icon" />
									</span>
									<span className="community-name">{props.ctx.communityMap.get(post.community_id ?? '')}</span>
								</a>
							)
						: null}

					{ post.is_spoiler
						? (
								<div className="spoiler-wrapper" id={`spoiler-${post.id}`}>
									<button data-post-id={post.id}>Show Spoiler</button>
								</div>
							)
						: null }

					<div className="post-content" data-href={!props.isReply ? `/posts/${post.id}` : undefined}>
						{post.body !== ''
							? (
									<p className="post-content-text">{post.body}</p>
								)
							: null}
						{post.screenshot && post.screenshot !== ''
							? (
									<img className="post-screenshot" src={utils.cdn(props.ctx, post.screenshot)} evt-click="alert(this.src)" />
								)
							: null}
						{post.painting !== ''
							? (
									<img className="post-memo" src={utils.cdn(props.ctx, `/paintings/${post.pid}/${post.id}.png`)} />
								)
							: null}
						{/* TODO add post.url back */}
					</div>

					<div className="post-buttons">
						<button
							type="button"
							className="submit yeah-button"
							data-button-yeah-post={post.id}
						>
							<span className={cx('sprite sp-yeah inline-sprite', {
								selected: hasYeahed
							})}
							>
							</span>
						</button>
						<a href={`/posts/${post.id}`} className="to-permalink-button" data-pjax="#body">
							<span className="sprite sp-yeah-small inline-sprite"></span>
							<span className="yeah-count" id={`count-${post.id}`}>{post.empathy_count}</span>
							{' '}
							{!props.isReply
								? (
										<>
											<span className="sprite sp-reply inline-sprite"></span>
											<span className="reply-count">{post.reply_count}</span>
										</>
									)
								: null}
						</a>
					</div>
				</div>
			</div>
			{/* TODO add locals.yeah logic back */}
		</div>
	);
}
