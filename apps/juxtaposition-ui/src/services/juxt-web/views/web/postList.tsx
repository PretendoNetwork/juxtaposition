import { WebPostView } from '@/services/juxt-web/views/web/post';
import type { InferSchemaType } from 'mongoose';
import type { ReactNode } from 'react';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type PostListViewProps = {
	ctx: RenderContext;
	userContent: InferSchemaType<typeof ContentSchema>;
	posts: InferSchemaType<typeof PostSchema>[];
	nextLink: string;
};

export function WebPostListView(props: PostListViewProps): ReactNode {
	if (props.posts.length === 0) {
		return <p className="no-posts-text">{props.ctx.lang.global.no_posts}</p>;
	}

	return (
		<>
			{props.posts.map(v => (
				<WebPostView key={v.id} ctx={props.ctx} post={v} userContent={props.userContent} />
			))}
			<div id="wrapper" className="bottom">
				<button id="load-more" data-href={props.nextLink}>{props.ctx.lang.global.more}</button>
			</div>
		</>
	);
}

export function WebPostListClosedView(): ReactNode {
	return <div className="headline"><h2>This community is closed to new posts.</h2></div>;
}
