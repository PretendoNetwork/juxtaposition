import type { ReactNode } from 'react';
import type { HydratedSettingsDocument } from '@/models/settings';

export type AccountStatusEditorProps = {
	userSettings: HydratedSettingsDocument;
};

export function WebAccountStatusEditor(props: AccountStatusEditorProps): ReactNode {
	return (
		<form data-pnid-save-form={props.userSettings.pid}>
			<div className="mt-5 text-center">
				<h4 className="text-right">Juxt User Settings</h4>
			</div>
			<div className="row mt-2">
				<div className="col">
					<label className="labels">Account Status</label>
					<select className="form-select" data-account-status-editor aria-label="Account Status" name="account_status">
						<option value="0" selected={props.userSettings.account_status === 0}>Normal</option>
						<option value="1" selected={props.userSettings.account_status === 1}>Limited from Posting</option>
						<option value="2" selected={props.userSettings.account_status === 2}>Temp Ban</option>
						<option value="3" selected={props.userSettings.account_status === 3}>Permanent Ban</option>
					</select>
					<p data-show-when-status="0">Selected 0</p>
					<p data-show-when-status="1">Selected 1</p>
					<p data-show-when-status="2">Selected 2</p>
					<p data-show-when-status="3">Selected 3</p>
				</div>
				<div className="col">
					<label className="labels">Banned Until:</label>
					<input type="datetime-local" id="ban_lift_date" data-init-date-value={props.userSettings.ban_lift_date?.toISOString()} data-date-picker-preview name="ban_lift_date" />
				</div>
				<div data-date-preview-for="ban_lift_date">
					<div className="col">
						{'UTC: '}
						<span id="ban_lift_date_utc" data-date-preview-utc />
					</div>
					<div className="col">
						{'Remaining: '}
						<span data-date-preview-until />
					</div>
				</div>
				<div className="col">
					<label className="labels">Ban Reason</label>
					<input type="text" name="ban_reason" className="form-control" placeholder="Ban reason" style={{ width: '100%' }} value={props.userSettings.ban_reason ?? undefined} />
				</div>
			</div>
			<div className="mt-5 text-center">
				<button className="btn btn-primary profile-button" type="submit">Save User</button>
			</div>
		</form>
	);
}
