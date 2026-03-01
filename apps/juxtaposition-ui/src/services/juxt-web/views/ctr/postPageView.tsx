import cx from 'classnames';
import { t } from 'i18next';
import { CtrRoot, CtrPageBody } from '@/services/juxt-web/views/ctr/root';
import { CtrPostView } from '@/services/juxt-web/views/ctr/post';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';

export function CtrPostPageView(props: PostPageViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const { post, community } = props;
	const { bannerUrl, legacy } = url.ctrHeader(community);

	return (
		<CtrRoot title={t('global.activity_feed')}>
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
							)}
				</header>

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
