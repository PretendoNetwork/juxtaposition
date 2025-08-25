import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ReactNode } from 'react';

export type ReportModalViewProps = {
	ctx: RenderContext;
};

export function WebReportModalView(props: ReportModalViewProps): ReactNode {
	if (props.ctx.pid === 1000000000) {
		return null;
	}

	return (
		<div id="report-form-modal" hidden>
			<form method="post" action="/" id="report-form" name="report" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="post_id" id="report-post-id" defaultValue="null" />
				<div className="report">
					<h2 className="page-title">Report Post</h2>
					<p>
						You are about to report a post with content which violates the Juxtaposition Code of Conduct.
						This report will be sent to Pretendo's Juxtaposition administrators and not to the creator of the post.
					</p>
					<div>
						<h4>Violation Type:</h4>
						<select name="reason" id="report">
							<option defaultValue="0">Spoiler</option>
							<option defaultValue="1">Personal Information</option>
							<option defaultValue="2">Violent Content</option>
							<option defaultValue="3">Inappropriate/Harmful Conduct</option>
							<option defaultValue="4">Hateful/Bullying</option>
							<option defaultValue="5">Advertising</option>
							<option defaultValue="6">Sexually Explicit</option>
							<option defaultValue="7">Piracy</option>
							<option defaultValue="8">Inappropriate Behavior in Game</option>
							<option defaultValue="10">Missing Images</option>
							<option defaultValue="9">Other</option>
						</select>
					</div>
					<textarea name="message" defaultValue="" maxLength={280} placeholder="Enter additional comments or information"></textarea>
				</div>
				<div id="button-wrapper">
					<input id="report-cancel-button" type="button" className="olv-modal-close-button fixed-bottom-button left" defaultValue="Cancel" />
					<input id="report-submit-button" type="submit" className="post-button fixed-bottom-button" defaultValue="Submit" />
				</div>
			</form>
		</div>
	);
}
