import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalPostView } from '@/services/juxt-web/views/portal/post';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';

export function PortalPostPageView(props: PostPageViewProps): ReactNode {
	const user = useUser();
	const { post } = props;
	const pageTitle = !post.removed ? post.screen_name : 'Removed Post';

	return (
		<PortalRoot title={T.str('global.activity_feed')}>
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className="left">{pageTitle}</h1>
					{!post.removed && props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button"
									href={`/posts/${post.id}/create`}
									data-pjax="#body"
								>
									<T k="post.reply_post" />
								</a>
							)
						: null}
					{!post.removed
						? (
								post.pid === user.pid
									? (
											<a id="header-communities-button" className="delete" href="#" data-button-delete-post={post.id}>
												<T k="post.delete_post" />
											</a>
										)
									: (
											<a
												id="header-communities-button"
												className="report"
												href={`/posts/${post.id}/report`}
												data-pjax="#body"
											>
												<T k="post.report_post" />
											</a>
										)
							)
						: null}
				</header>
				<div className="body-content post-list" id="post">
					<div className="post-wrapper parent">
						<PortalPostView post={post} userContent={props.userContent} isMainPost />
					</div>
					{props.replies.map(replyPost => (
						<PortalPostView key={post.id} post={replyPost} userContent={props.userContent} isReply />
					))}
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
