import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { ReportPostViewProps } from '@/services/juxt-web/views/web/reportPostView';

export function CtrReportPostView(props: ReportPostViewProps): ReactNode {
	return (
		<div id="report-post-page">
			<CtrPageTitledHeader
				data-toolbar-mode="wide"
				data-toolbar-message={T.str('reporting.submit')}
			>
				<T k="reporting.title" />
			</CtrPageTitledHeader>
			<form method="post" action={`/posts/${props.id}/report`} className="report-form post" name="report">
				<input type="hidden" name="post_id" id="report-post-id" value={props.id} />
				<p><T k="reporting.description" /></p>
				<div className="dropdown">
					<label htmlFor="report">
						<T k="reporting.label" />
						{' '}
					</label>
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
				<textarea
					name="message"
					maxLength={280}
					rows={4}
					placeholder={T.str('reporting.additional_info_placeholder')}
				>
				</textarea>
				<input type="submit" id="submit" />
			</form>
		</div>
	);
}

export function CtrReportPostPage(props: ReportPostViewProps): ReactNode {
	return (
		<CtrRoot title={T.str('reporting.title')}>
			<CtrPageBody>
				<CtrReportPostView {...props} />
			</CtrPageBody>
		</CtrRoot>
	);
}
