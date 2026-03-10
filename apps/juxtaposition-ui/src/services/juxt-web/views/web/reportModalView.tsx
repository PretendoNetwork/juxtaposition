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
