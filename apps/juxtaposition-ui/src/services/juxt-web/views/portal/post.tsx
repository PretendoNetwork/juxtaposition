import cx from 'classnames';
import moment from 'moment';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { PostViewProps } from '@/services/juxt-web/views/web/post';

export function PortalPostView(props: PostViewProps): ReactNode {
	const post = props.post;
	const hasYeahed = post.yeahs && post.yeahs.indexOf(props.ctx.pid) !== -1;
	const isModerator = props.ctx.moderator;
	// TODO implement moderator removed post logic

	const content = (
		<>
			<a href={utils.url('/users/show', { pid: post.pid })} className="mii-icon-container" data-pjax="#body">
				<img src={post.mii_face_url} className="mii-icon" />
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
					id={post.id}
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
									<a href={utils.url('/topics', { topic_tag: post.topic_tag })} data-pjax="#body">
										{/* TODO this has been modified due to inbalanced tags */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="30" height="30">
											<path d="M42.34,138.34A8,8,0,0,1,40,132.69V40h92.69a8,8,0,0,1,5.65,2.34l99.32,99.32a8,8,0,0,1,0,11.31L153,237.66a8,8,0,0,1-11.31,0Z" fill="#a362d8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
											<circle fill="#fff" cx="84" cy="84" r="12" />
										</svg>
										<span className="tags">{post.topic_tag}</span>
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
						{post.screenshot && post.screenshot !== '' ? <img className="post-screenshot" src={utils.cdn(props.ctx, post.screenshot)} /> : null}
						{post.painting !== '' ? <img className="post-memo" src={utils.cdn(props.ctx, `/paintings/${post.pid}/${post.id}.png`)} /> : null}
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
											<button type="button" className="submit remove" data-post={post.id} evt-click="deletePost(this)"></button>
										</div>
									)
								: null}
							{ !props.isMainPost
								? (
										<>
											<span className="feeling" id={`count-${post.id}`}>{post.empathy_count}</span>
											{ !props.isReply
												? (
														<span className="reply">{post.reply_count}</span>
													)
												: null}
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
										<img src={utils.cdn(props.ctx, `/mii/${yeah}/normal_face.png`)} className="mii-icon" />
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
