import type { ReactNode } from 'react';
import type { HydratedSettingsDocument } from '@/models/settings';

export type AccountStatusEditorProps = {
	userSettings: HydratedSettingsDocument;
};

function DatePickerWithPreview(props: { value?: Date; id: string; name: string; label: string }): ReactNode {
	return (
		<div className="col">
			<label className="labels">{props.label}</label>
			<input type="datetime-local" id={props.id} data-init-date-value={props.value} data-date-picker-preview name={props.name} required />
			<div data-date-preview-for={props.id}>
				<div className="col">
					{'UTC: '}
					<span id="ban_lift_date_utc" data-date-preview-utc />
				</div>
				<div className="col">
					{'Remaining: '}
					<span data-date-preview-until />
				</div>
			</div>
		</div>
	);
}

function AccountStatusTab(props: { pid: number; status: number; children?: ReactNode }): ReactNode {
	return (
		<form data-pnid-save-form={props.pid} data-show-when-status={props.status}>
			<input type="hidden" name="account_status" value={props.status} />
			{props.children}
			<button className="btn btn-primary profile-button" type="submit">Save</button>
		</form>
	);
}

export function WebAccountStatusEditor(props: AccountStatusEditorProps): ReactNode {
	const status = props.userSettings.account_status;
	const pid = props.userSettings.pid;
	const reason = props.userSettings.ban_reason ?? undefined;

	return (
		<div>
			<div className="mt-5 text-center">
				<h4>Juxt User Settings</h4>
				<select className="form-select" data-account-status-editor>
					<option value="0" selected={status === 0}>Normal</option>
					<option value="1" selected={status === 1}>Limited from Posting</option>
					<option value="2" selected={status === 2}>Temp Ban</option>
					<option value="3" selected={status === 3}>Permanent Ban</option>
				</select>
			</div>
			<AccountStatusTab pid={pid} status={0}>
				<p>Normal status</p>
			</AccountStatusTab>
			<AccountStatusTab pid={pid} status={1}>
				<p>Limit from posting</p>
				<DatePickerWithPreview id="ban_lift_date_limitposting" name="ban_lift_date" label="Limited until:" />
				<div className="col">
					<label className="labels">Reason</label>
					<input type="text" name="ban_reason" className="form-control" placeholder="Reason" style={{ width: '100%' }} value={reason} />
				</div>
			</AccountStatusTab>
			<AccountStatusTab pid={pid} status={2}>
				<p>Temporary ban</p>
				<DatePickerWithPreview id="ban_lift_date_temp" name="ban_lift_date" label="Banned until:" />
				<div className="col">
					<label className="labels">Reason</label>
					<input type="text" name="ban_reason" className="form-control" placeholder="Reason" style={{ width: '100%' }} value={reason} />
				</div>
			</AccountStatusTab>
			<AccountStatusTab pid={pid} status={3}>
				<p>Permanent ban</p>
				<div className="col">
					<label className="labels">Reason</label>
					<input type="text" name="ban_reason" className="form-control" placeholder="Reason" style={{ width: '100%' }} value={reason} />
				</div>
			</AccountStatusTab>
		</div>
	);
}
