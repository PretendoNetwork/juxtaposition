import { T } from '@/services/juxt-web/views/common/components/T';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import type { ReactNode } from 'react';

export function WebReportModalView(): ReactNode {
	const user = useUser();
	if (user.pid === 1000000000) {
		return null;
	}

	return (
		<div id="report-form-modal" hidden>
			<form method="post" action="/" id="report-form" name="report" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="post_id" id="report-post-id" value="null" />
				<div className="report">
					<h2 className="page-title"><T k="reporting.title" /></h2>
					<p><T k="reporting.description" /></p>
					<div>
						<h4><T k="reporting.label" /></h4>
						<select name="reason" id="report">
							<option value="201"><T k="reporting.reason_not_nice" /></option>
							<option value="202"><T k="reporting.reason_inappropriate" /></option>
							<option value="203"><T k="reporting.reason_spam" /></option>
							<option value="204"><T k="reporting.reason_offtopic" /></option>
							<option value="205"><T k="reporting.reason_piracy_new" /></option>
							<option value="208"><T k="reporting.reason_exploits" /></option>
							<option value="209"><T k="reporting.reason_drama" /></option>
							<option value="210"><T k="reporting.reason_cheating" /></option>
							<option value="211"><T k="reporting.reason_spoiler_new" /></option>
							<option value="212"><T k="reporting.reason_personal_info_new" /></option>
							<option value="213"><T k="reporting.reason_politics" /></option>
							<option value="214"><T k="reporting.reason_misinformation" /></option>
							<option value="215"><T k="reporting.reason_impersonation" /></option>
							<option value="216"><T k="reporting.reason_others" /></option>
						</select>
					</div>
					<textarea name="message" value="" maxLength={280} placeholder="Enter additional comments or information"></textarea>
				</div>
				<div id="button-wrapper">
					<input id="report-cancel-button" type="button" className="olv-modal-close-button fixed-bottom-button left" value={T.str('global.close')} />
					<input id="report-submit-button" type="submit" className="post-button fixed-bottom-button" value={T.str('reporting.submit')} />
				</div>
			</form>
		</div>
	);
}
