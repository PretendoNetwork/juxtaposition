import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNewPostView } from '@/services/juxt-web/views/portal/newPostView';
import { PortalPostView } from '@/services/juxt-web/views/portal/post';
import type { ReactNode } from 'react';
import type { PostPageViewProps } from '@/services/juxt-web/views/web/postPageView';

export function PortalPostPageView(props: PostPageViewProps): ReactNode {
	const { post } = props;
	const pageTitle = !post.removed ? post.screen_name : 'Removed Post';

	return (
		<PortalRoot title={props.ctx.lang.global.activity_feed}>
			<PortalNavBar ctx={props.ctx} selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className="left">{pageTitle}</h1>
					{!post.removed && props.canPost
						? (
								<a id="header-post-button" className="header-button" href="#" data-module-hide="post" data-module-show="add-post-page" data-header="false" data-menu="false">Reply</a>
							)
						: null}
					{!post.removed
						? (
								post.pid === props.ctx.pid
									? (
											<a id="header-communities-button" className="delete" href="#" data-post={post.id} evt-click="deletePost(this)">Delete Post</a>
										)
									: (
											<>
												<a id="report-launcher" style={{ display: 'none' }} data-module-hide="post" data-module-show="report-post-page" data-header="false" data-menu="false"></a>
												<a id="header-communities-button" className="report" href="#" data-post={post.id} evt-click="reportPost(this)">Report Post</a>
											</>
										)
							)
						: null}
				</header>
				<div className="body-content post-list" id="post">
					<div className="post-wrapper parent">
						<PortalPostView ctx={props.ctx} post={post} isMainPost />
					</div>
					{props.replies.map(replyPost => (
						<PortalPostView key={post.id} ctx={props.ctx} post={replyPost} isReply />
					))}
				</div>
				{props.canPost ? <PortalNewPostView ctx={props.ctx} id={post.community_id ?? ''} name={post.screen_name ?? ''} url={`/posts/${post.id}/new`} show="post" /> : null}

				<div id="report-post-page" className="add-post-page official-user-post" style={{ display: 'none' }}>
					<header className="add-post-page-header">
						<h1 className="page-title">Report Post</h1>
					</header>
					<form method="post" action={`/posts/${post.id}/report`} id="report-form" name="report" data-is-own-title="1" data-is-identified="1">
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
						<input type="submit" className="post-button fixed-bottom-button" value="Submit" evt-click="wiiuBrowser.lockUserOperation(true);" />
					</form>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
