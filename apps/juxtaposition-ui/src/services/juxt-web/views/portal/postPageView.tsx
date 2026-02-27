import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalPostView } from '@/services/juxt-web/views/portal/post';
import type { ReactNode } from 'react';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';

export function PortalPostPageView(props: PostPageViewProps): ReactNode {
	const { post } = props;
	const pageTitle = !post.removed ? post.screen_name : 'Removed Post';

	return (
		<PortalRoot ctx={props.ctx} title={props.ctx.lang.global.activity_feed}>
			<PortalNavBar ctx={props.ctx} selection={-1} />
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
									Reply
								</a>
							)
						: null}
					{!post.removed
						? (
								post.pid === props.ctx.pid
									? (
											<a id="header-communities-button" className="delete" href="#" data-button-delete-post={post.id}>Delete Post</a>
										)
									: (
											<a
												id="header-communities-button"
												className="report"
												href={`/posts/${post.id}/report`}
												data-pjax="#body"
											>
												Report Post
											</a>
										)
							)
						: null}
				</header>
				<div className="body-content post-list" id="post">
					<div className="post-wrapper parent">
						<PortalPostView ctx={props.ctx} post={post} userContent={props.userContent} isMainPost />
					</div>
					{props.replies.map(replyPost => (
						<PortalPostView key={post.id} ctx={props.ctx} post={replyPost} userContent={props.userContent} isReply />
					))}
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
