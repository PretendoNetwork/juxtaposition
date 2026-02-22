import { PortalPostView } from '@/services/juxt-web/views/portal/post';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';

export function PortalPostListView(props: PostListViewProps): ReactNode {
	if (props.posts.length === 0) {
		return <p className="no-posts-text"><T k="global.no_posts" /></p>;
	}

	return (
		<>
			{props.posts.map(v => (
				<PortalPostView key={v.id} post={v} userContent={props.userContent} />
			))}
			<div className="button-wrapper center">
				<button type="button" className="load-more" data-href={props.nextLink}><T k="global.more" /></button>
			</div>
		</>
	);
}

export function PortalPostListClosedView(): ReactNode {
	return <div className="headline"><h2>This community is closed to new posts.</h2></div>;
}
