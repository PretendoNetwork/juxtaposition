import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import type { ReactNode } from 'react';
import type { TopicTagViewProps } from '@/services/juxt-web/views/web/topics';

export function CtrTopicTagView(props: TopicTagViewProps): ReactNode {
	return (
		<CtrRoot ctx={props.ctx} title={props.title}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title">{props.title}</h1>
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="tab-body post-list">
						<CtrPostListView ctx={props.ctx} nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
