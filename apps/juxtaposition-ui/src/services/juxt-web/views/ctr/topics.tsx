import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { CtrPostListView } from '@/services/juxt-web/views/ctr/postList';
import { CtrPageHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { TopicTagViewProps } from '@/services/juxt-web/views/web/topics';

export function CtrTopicTagView(props: TopicTagViewProps): ReactNode {
	return (
		<CtrRoot title={props.title}>
			<CtrPageBody>
				<CtrPageHeader
					type="plain"
					data-toolbar-mode="normal"
					data-toolbar-active-button="3"
				>
					{props.title}
				</CtrPageHeader>

				<div className="body-content tab2-content" id="community-post-list">
					<div className="tab-body post-list">
						<CtrPostListView nextLink={props.nextLink} userContent={props.userContent} posts={props.posts} />
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
