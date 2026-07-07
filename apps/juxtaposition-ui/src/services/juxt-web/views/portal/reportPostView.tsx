import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/components/PortalNavBar';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { ReportPostViewProps } from '@/services/juxt-web/views/web/reportPostView';

export function PortalReportPostView(props: ReportPostViewProps): ReactNode {
	return (
		<div id="report-post-page" className="add-post-page official-user-post">
			<header className="add-post-page-header">
				<h1 className="page-title"><T k="reporting.title" /></h1>
			</header>
			<form method="post" action={`/posts/${props.id}/report`} id="report-form" name="report" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="post_id" id="report-post-id" value={props.id} />
				<div className="add-post-page-content report">
					<p><T k="reporting.description" /></p>
					<div>
						<h4><T k="reporting.label" /></h4>
						<select name="reason" id="report">
							<option value="11"><T k="reporting.reason_not_nice" /></option>
							<option value="12"><T k="reporting.reason_inappropriate" /></option>
							<option value="13"><T k="reporting.reason_spam" /></option>
							<option value="14"><T k="reporting.reason_offtopic" /></option>
							<option value="15"><T k="reporting.reason_piracy_new" /></option>
							<option value="16"><T k="reporting.reason_exploits" /></option>
							<option value="17"><T k="reporting.reason_drama" /></option>
							<option value="18"><T k="reporting.reason_cheating" /></option>
							<option value="19"><T k="reporting.reason_spoiler_new" /></option>
							<option value="20"><T k="reporting.reason_personal_info_new" /></option>
							<option value="21"><T k="reporting.reason_politics" /></option>
							<option value="22"><T k="reporting.reason_misinformation" /></option>
							<option value="23"><T k="reporting.reason_impersonation" /></option>
							<option value="10"><T k="reporting.reason_others" /></option>
						</select>
					</div>
					<textarea name="message" className="textarea-text" value="" maxLength={280} placeholder={T.str('reporting.additional_info_placeholder')}></textarea>
				</div>
				<input type="submit" className="post-button fixed-bottom-button" value="Submit" evt-click="wiiuBrowser.lockUserOperation(true);" />
			</form>
		</div>
	);
}

export function PortalReportPostPage(props: ReportPostViewProps): ReactNode {
	return (
		<PortalRoot title={T.str('reporting.title')}>
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<PortalReportPostView {...props} />
			</PortalPageBody>
		</PortalRoot>
	);
}
