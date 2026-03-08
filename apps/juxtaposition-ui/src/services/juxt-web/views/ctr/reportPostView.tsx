import { t } from 'i18next';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { ReportPostViewProps } from '@/services/juxt-web/views/web/reportPostView';

export function CtrReportPostView(props: ReportPostViewProps): ReactNode {
	return (
		<div id="report-post-page">
			<header
				id="header"
				data-toolbar-mode="wide"
				data-toolbar-message={t('reporting.submit')}
			>
				<h1 id="page-title"><T k="reporting.title" /></h1>
			</header>
			<form method="post" action={`/posts/${props.id}/report`} className="report-form post" name="report">
				<input type="hidden" name="post_id" id="report-post-id" value={props.id} />
				<p><T k="reporting.description" /></p>
				<div className="dropdown">
					<label htmlFor="report">
						<T k="reporting.label" />
						{' '}
					</label>
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
				<textarea
					name="message"
					maxLength={280}
					rows={4}
					placeholder={t('reporting.additional_info_placeholder')}
				>
				</textarea>
				<input type="submit" id="submit" />
			</form>
		</div>
	);
}

export function CtrReportPostPage(props: ReportPostViewProps): ReactNode {
	return (
		<CtrRoot title={t('reporting.title')}>
			<CtrPageBody>
				<CtrReportPostView {...props} />
			</CtrPageBody>
		</CtrRoot>
	);
}
