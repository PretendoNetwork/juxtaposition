import { WebPostView } from '@/services/juxt-web/views/web/post';
import { T } from '@/services/juxt-web/views/common/components/T';
import { buildUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { Post, SelfContent } from '@/api/generated';

export type PostListViewProps = {
	userContent: SelfContent | null;
	posts: Post[];
	nextLink: string;
	prevPageLink: string | null;
	nextPageLink: string;
};

export function WebPostListView(props: PostListViewProps): ReactNode {
	if (props.posts.length === 0) {
		return <p className="no-posts-text"><T k="global.no_posts" /></p>;
	}

	return (
		<>
			{props.posts.map(v => (
				<WebPostView key={v.id} post={v} userContent={props.userContent} />
			))}
			<div id="wrapper" className="bottom">
				<button id="load-more" data-href={props.nextLink}><T k="global.more" /></button>
			</div>
		</>
	);
}

export function WebPostListClosedView(): ReactNode {
	return <div className="headline"><h2><T k="community.closed" /></h2></div>;
}

export type PostListViewLinks = {
	nextLink: string;
	prevPageLink: string | null;
	nextPageLink: string;
};

/**
 * Helper function to populate the Link fields for PostListViewProps
 */
export function buildPostListLinks(baseUrl: string, offset: number, length: number): PostListViewLinks {
	return {
		nextLink: buildUrl(baseUrl, {
			offset: offset + length,
			pjax: 'true'
		}),
		prevPageLink: offset > 0
			? buildUrl(baseUrl, {
					offset: Math.max(offset - length, 0)
				})
			: null,
		nextPageLink: buildUrl(baseUrl, {
			offset: offset + length
		})
	};
}
