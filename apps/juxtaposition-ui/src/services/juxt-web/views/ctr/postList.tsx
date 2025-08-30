import { CtrPostView } from '@/services/juxt-web/views/ctr/post';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';
import type { ReactNode } from 'react';

export function CtrPostListView(props: PostListViewProps): ReactNode {
	if (props.posts.length === 0) {
		return <p className="no-posts-text">{props.ctx.lang.global.no_posts}</p>;
	}

	return (
		<>
			{props.posts.map(v => (
				<CtrPostView key={v.id} ctx={props.ctx} post={v} userContent={props.userContent} />
			))}
			<div className="button-wrapper center">
				<button type="button" className="load-more" data-href={props.nextLink}>{props.ctx.lang.global.more}</button>
			</div>
		</>
	);
}

export function CtrPostListClosedView(): ReactNode {
	return <div className="headline"><h2>This community is closed to new posts.</h2></div>;
}
