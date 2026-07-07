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
							<option value="9"><T k="reporting.reason_others" /></option>
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
