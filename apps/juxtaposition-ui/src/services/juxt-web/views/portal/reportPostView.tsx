import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { ReportPostViewProps } from '@/services/juxt-web/views/web/reportPostView';

export function PortalReportPostView(props: ReportPostViewProps): ReactNode {
	return (
		<div id="report-post-page" className="add-post-page official-user-post">
			<header className="add-post-page-header">
				<h1 className="page-title">Report Post</h1>
			</header>
			<form method="post" action={`/posts/${props.id}/report`} id="report-form" name="report" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="post_id" id="report-post-id" value={props.id} />
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
				<input type="submit" className="post-button fixed-bottom-button" value="Submit" evt-click="wiiuBrowser.lockUserOperation(true);" />
			</form>
		</div>
	);
}

export function PortalReportPostPage(props: ReportPostViewProps): ReactNode {
	return (
		<PortalRoot ctx={props.ctx} title="Report Post">
			<PortalNavBar ctx={props.ctx} selection={-1} />
			<PortalPageBody>
				<PortalReportPostView {...props} />
			</PortalPageBody>
		</PortalRoot>
	);
}
