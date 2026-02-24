import cx from 'classnames';
import { CtrRoot, CtrPageBody } from '@/services/juxt-web/views/ctr/root';
import { CtrPostView } from '@/services/juxt-web/views/ctr/post';
import { CtrNewPostView } from '@/services/juxt-web/views/ctr/newPostView';
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
				>
					<h1 id="page-title">{post.screen_name}</h1>
					{props.canPost
						? (
								<a
									id="header-post-button"
									className="header-button left"
									href="#"
									data-sound="SE_WAVE_SELECT_TAB"
									data-module-hide="post"
									data-module-show="add-post-page"
									data-header="false"
									data-screenshot="true"
									data-message={`Reply to ${post.screen_name}`}
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
									<a id="report-launcher" style={{ display: 'none' }} data-module-hide="post" data-module-show="report-post-page" data-header="false" data-menu="false"></a>
									<a id="header-communities-button" className="report header-button right" href="#" data-post={post.id} evt-click="reportPost(this)">Report Post</a>
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
				{props.canPost ? <CtrNewPostView ctx={props.ctx} id={post.community_id ?? ''} name={post.screen_name ?? ''} url={`/posts/${post.id}/new`} show="post" ctrBanner={bannerUrl} ctrLegacy={legacy} /> : null}

				<div id="report-post-page" className="add-post-page official-user-post" style={{ display: 'none' }}>
					<header className="add-post-page-header" id="header">
						<h1 id="page-title">Report Post</h1>
					</header>
					<form method="post" action={`/posts/${post.id}/report`} id="report-form" className="post" name="report" data-is-own-title="1" data-is-identified="1">
						<input type="hidden" name="post_id" id="report-post-id" value={post.id ?? undefined} />
						<div className="add-post-page-content report">
							<p>
								You are about to report a post with content which violates the Juxtaposition Code of Conduct.
								This report will be sent to Pretendo's Juxtaposition administrators and not to the creator of the post.
							</p>
							<div>
								<h4>Violation Type:</h4>
								<select name="reason" id="report">
									<option value="0">Spoiler</option>
									<option value="1">Personal Information</option>
									<option value="2">Violent Content</option>
									<option value="3">Inappropriate/Harmful Conduct</option>
									<option value="4">Hateful/Bullying</option>
									<option value="5">Advertising</option>
									<option value="6">Sexually Explicit</option>
									<option value="7">Piracy</option>
									<option value="8">Inappropriate Behavior in Game</option>
									<option value="10">Missing Images</option>
									<option value="9">Other</option>
								</select>
							</div>
							<textarea name="message" className="textarea-text" value="" maxLength={280} placeholder="Enter additional comments or information"></textarea>
						</div>
						<input
							type="button"
							className="olv-modal-close-button fixed-bottom-button left"
							value="Cancel"
							data-sound="SE_WAVE_CANCEL"
							data-module-show="post"
							data-module-hide="report-post-page"
							data-header="true"
							data-menu="true"
						/>
						<input type="submit" className="post-button fixed-bottom-button" value="Submit" />
					</form>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
