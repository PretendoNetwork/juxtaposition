import { CtrPostView } from '@/services/juxt-web/views/ctr/components/CtrPostView';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrSystemPostView } from '@/services/juxt-web/views/ctr/components/CtrSystemPostView';
import type { ReactNode } from 'react';
import type { PostListViewProps } from '@/services/juxt-web/views/web/postList';

export function CtrPostListView(props: PostListViewProps): ReactNode {
	if (props.posts.length === 0) {
		return <p className="no-posts-text"><T k="global.no_posts" /></p>;
	}

	return (
		<>
			{props.posts.map(v => (
				<CtrPostView key={v.id} post={v} userContent={props.userContent} />
			))}
			<div className="button-wrapper center">
				<a className="load-more" href={props.nextPageLink} data-pjax="#body"><T k="global.more" /></a>
			</div>
		</>
	);
}

export function CtrPostListClosedView(): ReactNode {
	return <CtrSystemPostView type="system"><T k="community.closed" /></CtrSystemPostView>;
}
