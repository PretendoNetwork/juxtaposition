import cx from 'classnames';
import { CtrRoot, CtrPageBody } from '@/services/juxt-web/views/ctr/root';
import { CtrPostView } from '@/services/juxt-web/views/ctr/post';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';

export function CtrPostPageView(props: PostPageViewProps): ReactNode {
	const { post, community } = props;
	const { bannerUrl, legacy } = utils.ctrHeader(props.ctx, community);

	return (
		<CtrRoot ctx={props.ctx} title={props.ctx.lang.global.activity_feed}>
			<CtrPageBody>
				<header
					id="header"
					style={{
						background: `url('${bannerUrl}')`
					}}
					className={cx(
						'buttons',
						{ 'header-legacy': legacy }
					)}
					data-toolbar-mode="normal"
				>
					<h1 id="page-title">{post.screen_name}</h1>
					{props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button left"
									href={`/posts/${post.id}/create`}
									data-pjax="#body"
								>
									Reply +
								</a>
							)
						: null}
					{post.pid === props.ctx.pid
						? (
								<a id="header-communities-button" className="delete header-button right" href="#" data-button-delete-post={post.id}>Delete Post</a>
							)
						: (
								<>
									<a
										id="header-communities-button"
										className="report header-button right"
										href={`/posts/${post.id}/report`}
										data-pjax="#body"
									>
										Report Post
									</a>
								</>
							)}
				</header>

				<div className="body-content tab2-content" id="post">
					<div className="post-wrapper parent">
						<CtrPostView ctx={props.ctx} post={post} userContent={props.userContent} isMainPost />
					</div>
					{props.replies.map(replyPost => (
						<CtrPostView key={post.id} ctx={props.ctx} post={replyPost} userContent={props.userContent} isReply />
					))}
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
