import { CtrRoot, CtrPageBody } from '@/services/juxt-web/views/ctr/root';
import { CtrPostView } from '@/services/juxt-web/views/ctr/post';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';

export function CtrPostPageView(props: PostPageViewProps): ReactNode {
	const url = useUrl();
	const { post, community } = props;
	const header = url.ctrHeader(community);

	return (
		<CtrRoot title={T.str('global.activity_feed')}>
			<CtrPageBody>
				<CtrPageHeader
					type="plain"
					header={header}
					data-toolbar-mode="normal"
				>
					{post.screen_name}
				</CtrPageHeader>

				{/* {props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button left"
									href={`/posts/${post.id}/create`}
									data-pjax="#body"
								>
									<T k="post.reply_post" />
									{' +'}
								</a>
							)
						: null}
					{post.pid === user.pid
						? (
								<a id="header-communities-button" className="delete header-button right" href="#" data-button-delete-post={post.id}>
									<T k="post.delete_post" />
								</a>
							)
						: (
								<>
									<a
										id="header-communities-button"
										className="report header-button right"
										href={`/posts/${post.id}/report`}
										data-pjax="#body"
									>
										<T k="post.report_post" />
									</a>
								</>
							)} */}
				<div className="body-content tab2-content" id="post">
					<div className="post-wrapper parent">
						<CtrPostView post={post} userContent={props.userContent} isMainPost />
					</div>
					{props.replies.map(replyPost => (
						<CtrPostView key={post.id} post={replyPost} userContent={props.userContent} isReply />
					))}
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
