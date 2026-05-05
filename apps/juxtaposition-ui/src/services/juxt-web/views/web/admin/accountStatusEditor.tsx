import type { ReactNode } from 'react';
import type { ModerationProfile } from '@/api/generated';

export type AccountStatusEditorProps = {
	modProfile: ModerationProfile;
};

function DatePickerWithPreview(props: { value?: Date; id: string; name: string; label: string }): ReactNode {
	return (
		<div className="field">
			<label>{props.label}</label>
			<input type="datetime-local" id={props.id} data-init-date-value={props.value} data-date-picker-preview name={props.name} required />
			<div className="date-preview" data-date-preview-for={props.id}>
				<div className="segment">
					<p className="segment-label">UTC</p>
					<p data-date-preview-utc />
				</div>
				<div className="segment">
					<p className="segment-label">Banned until</p>
					<p data-date-preview-until />
				</div>
			</div>
		</div>
	);
}

function AccountStatusTab(props: { pid: number; status: number; footerText?: string; children?: ReactNode }): ReactNode {
	return (
		<form data-pnid-save-form={props.pid} data-show-when-status={props.status}>
			<input type="hidden" name="account_status" value={props.status} />
			<div className="content">
				{props.children}
			</div>
			<div className="footer">
				<p className="footer-text">{props.footerText}</p>
				<button className="footer-button" type="submit">Save</button>
			</div>
		</form>
	);
}

export function WebAccountStatusEditor(props: AccountStatusEditorProps): ReactNode {
	const status = props.modProfile.accountStatus;
	const pid = props.modProfile.pid;
	const reason = props.modProfile.banReason ?? undefined;

	return (
		<div className="account-status-editor">
			<div className="header">
				<h4 className="header-title">Account status</h4>
				<select className="header-tab" data-account-status-editor>
					<option value="0" selected={status === 0}>Normal</option>
					<option value="1" selected={status === 1}>Limited from Posting</option>
					<option value="2" selected={status === 2}>Temp Ban</option>
					<option value="3" selected={status === 3}>Permanent Ban</option>
				</select>
			</div>
			<AccountStatusTab pid={pid} status={0} footerText="Set account to normal">
				<div className="field">
					<label>Reason</label>
					<input type="text" name="ban_reason" placeholder="Reason" value={reason} />
				</div>
			</AccountStatusTab>
			<AccountStatusTab pid={pid} status={1} footerText="Limit account from posting">
				<DatePickerWithPreview id="ban_lift_date_limitposting" name="ban_lift_date" label="Limit account until" />
				<div className="field">
					<label>Reason</label>
					<input type="text" name="ban_reason" placeholder="Reason" value={reason} />
				</div>
			</AccountStatusTab>
			<AccountStatusTab pid={pid} status={2} footerText="Issue temporary ban to account">
				<DatePickerWithPreview id="ban_lift_date_temp" name="ban_lift_date" label="Ban until" />
				<div className="field">
					<label>Reason</label>
					<input type="text" name="ban_reason" placeholder="Reason" value={reason} />
				</div>
			</AccountStatusTab>
			<AccountStatusTab pid={pid} status={3} footerText="Issue permanent ban to account">
				<div className="field">
					<label>Reason</label>
					<input type="text" name="ban_reason" placeholder="Reason" value={reason} />
				</div>
			</AccountStatusTab>
		</div>
	);
}
