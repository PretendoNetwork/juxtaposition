import { WebPostView } from '@/services/juxt-web/views/web/post';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { InferSchemaType } from 'mongoose';
import type { ReactNode } from 'react';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';
import type { Post } from '@/api/generated';

export type PostListViewProps = {
	userContent: InferSchemaType<typeof ContentSchema> | null;
	posts: InferSchemaType<typeof PostSchema>[] | Post[];
	nextLink: string;
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
