import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';
import type { ReportPostViewProps } from '@/services/juxt-web/views/web/reportPostView';

export function CtrReportPostView(props: ReportPostViewProps): ReactNode {
	return (
		<div id="report-post-page">
			<header
				id="header"
				data-toolbar-mode="wide"
				data-toolbar-message="Submit Report"
			>
				<h1 id="page-title">Report Post</h1>
			</header>
			<form method="post" action={`/posts/${props.id}/report`} className="report-form post" name="report">
				<input type="hidden" name="post_id" id="report-post-id" value={props.id} />
				<p>
					You are about to report a post with content which violates the Juxtaposition Code of Conduct.
					This report will be sent to Pretendo's Juxtaposition administrators and not to the creator of the post.
				</p>
				<div className="dropdown">
					<label htmlFor="report">{'Reason: '}</label>
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
				<textarea
					name="message"
					maxLength={280}
					rows={4}
					placeholder="Enter additional comments or information"
				>
				</textarea>
				<input type="submit" id="submit" />
			</form>
		</div>
	);
}

export function CtrReportPostPage(props: ReportPostViewProps): ReactNode {
	return (
		<CtrRoot title="Report Post">
			<CtrPageBody>
				<CtrReportPostView {...props} />
			</CtrPageBody>
		</CtrRoot>
	);
}
