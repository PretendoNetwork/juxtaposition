import type { ReactNode } from 'react';
import type { HydratedSettingsDocument } from '@/models/settings';

export type AccountStatusEditorProps = {
	userSettings: HydratedSettingsDocument;
};

export function WebAccountStatusEditor(props: AccountStatusEditorProps): ReactNode {
	return (
		<div>
			<div className="mt-5 text-center">
				<h4 className="text-right">Juxt User Settings</h4>
			</div>
			<div className="row mt-2">
				<div className="col">
					<label htmlFor="account_status" className="labels">Account Status</label>
					<select className="form-select" aria-label="Account Status" name="account_status" id="account_status">
						<option value="0" selected={props.userSettings.account_status === 0}>Normal</option>
						<option value="1" selected={props.userSettings.account_status === 1}>Limited from Posting</option>
						<option value="2" selected={props.userSettings.account_status === 2}>Temp Ban</option>
						<option value="3" selected={props.userSettings.account_status === 3}>Permanent Ban</option>
					</select>
				</div>
				<div className="col">
					<label htmlFor="ban_lift_date_picker" className="labels">Banned Until:</label>
					<input type="datetime-local" id="ban_lift_date_picker" name="ban_lift_date" />
					<input type="hidden" id="ban_lift_date" value={props.userSettings.ban_lift_date?.toISOString()} />
				</div>
				<div className="col">
					UTC:
					{' '}
					<span id="ban_lift_date_utc"></span>
				</div>
				<div className="col">
					Remaining:
					{' '}
					<span id="ban_lift_date_duration"></span>
				</div>
				<div className="col">
					<label htmlFor="ban_reason" className="labels">Ban Reason</label>
					<input id="ban_reason" type="text" className="form-control" placeholder="Ban reason" style={{ width: '100%' }} value={props.userSettings.ban_reason ?? undefined} />
				</div>
			</div>
			<div className="mt-5 text-center">
				<button className="btn btn-primary profile-button" type="button" data-button-admin-save-pnid={props.userSettings.pid}>Save User</button>
			</div>
		</div>
	);
}
