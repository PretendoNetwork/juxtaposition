import { PortalPostView } from '@/services/juxt-web/views/portal/post';
import type { ReactNode } from 'react';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';

export function PortalPostListView(props: PostListViewProps): ReactNode {
	if (props.posts.length === 0) {
		return <p className="no-posts-text">{props.ctx.lang.global.no_posts}</p>;
	}

	return (
		<>
			{props.posts.map(v => (
				<PortalPostView key={v.id} ctx={props.ctx} post={v} userContent={props.userContent} />
			))}
			<div className="button-wrapper center">
				<button type="button" className="load-more" data-href={props.nextLink}>{props.ctx.lang.global.more}</button>
			</div>
		</>
	);
}

export function PortalPostListClosedView(): ReactNode {
	return <div className="headline"><h2>This community is closed to new posts.</h2></div>;
}
