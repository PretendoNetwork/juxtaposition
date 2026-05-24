import moment from 'moment';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { Post } from '@/api/generated';

export type ModerateUserRemovedPostsViewProps = {
	removedPosts: Post[];
};

export function ModerateUserRemovedPostView(props: ModerateUserRemovedPostsViewProps): ReactNode {
	const url = useUrl();

	return (
		<div>
			<h4>
				Recently Removed Posts (
				{props.removedPosts.length}
				, limit 50 most recent)
			</h4>
			<ul className="list-content-with-icon-and-text arrow-list">
				{props.removedPosts.length === 0 ? <p>There's nothing here...</p> : null}
				{props.removedPosts.map((post) => {
					const removed = post.moderation?.removed;
					if (!removed) {
						return <p>Post {post.id} not accessible</p>; // Should be impossible
					}

					return (
						<li className="reports">
							<details>
								<summary>
									<div className="hover">
										<a href={`/users/${removed.removedBy.pid}`} className="icon-container notify">
											<img src={url.cdn(`/mii/${removed.removedBy.pid}/normal_face.png`)} className="icon" />
										</a>
										<span className="body messages report">
											<span className="text">
												<a href={`/users/${removed.removedBy.pid}`} className="nick-name">
													Removed By:
													{' '}
													{removed.removedBy?.miiName ?? 'Nobody'}
												</a>
												{' '}
												<span title={moment(removed.removedAt).toString()} className="timestamp">{moment(removed.removedAt).fromNow()}</span>
											</span>
											<span className="text">
												<p>
													{removed.reason}
												</p>
											</span>
										</span>
									</div>
								</summary>
								<WebPostView post={post} isReply={false} />
							</details>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
