import { t } from 'i18next';
import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
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
							<option value="0"><T k="reporting.reason_spoiler" /></option>
							<option value="1"><T k="reporting.reason_personal_info" /></option>
							<option value="2"><T k="reporting.reason_violence" /></option>
							<option value="3"><T k="reporting.reason_inappropiate" /></option>
							<option value="4"><T k="reporting.reason_bullying" /></option>
							<option value="5"><T k="reporting.reason_advertising" /></option>
							<option value="6"><T k="reporting.reason_nsfw" /></option>
							<option value="7"><T k="reporting.reason_piracy" /></option>
							<option value="8"><T k="reporting.reason_inappropiate_ingame" /></option>
							<option value="10"><T k="reporting.reason_missing_images" /></option>
							<option value="9"><T k="reporting.reason_other" /></option>
						</select>
					</div>
					<textarea name="message" className="textarea-text" value="" maxLength={280} placeholder={t('reporting.additional_info_placeholder')}></textarea>
				</div>
				<input type="submit" className="post-button fixed-bottom-button" value="Submit" evt-click="wiiuBrowser.lockUserOperation(true);" />
			</form>
		</div>
	);
}

export function PortalReportPostPage(props: ReportPostViewProps): ReactNode {
	return (
		<PortalRoot title={t('reporting.title')}>
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<PortalReportPostView {...props} />
			</PortalPageBody>
		</PortalRoot>
	);
}
