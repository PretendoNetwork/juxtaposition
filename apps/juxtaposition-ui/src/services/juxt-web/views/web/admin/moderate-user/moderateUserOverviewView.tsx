import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { AuditLog, ModerationProfile } from '@/api/generated';

export type ModerateUserOverviewViewProps = {
	auditLogs: AuditLog[];
	modProfile: ModerationProfile;
};

export function ModerateUserOverviewView(props: ModerateUserOverviewViewProps): ReactNode {
	const url = useUrl();

	return (
		<div>
			<div className="p-3 py-5">
				<div className="mt-5 text-center">
					<h4 className="text-right">Juxt User Settings</h4>
				</div>
				<div className="row mt-2">
					<div className="col">
						<label htmlFor="account_status" className="labels">Account Status</label>
						<select className="form-select" aria-label="Account Status" name="account_status" id="account_status">
							<option value="0" selected={props.modProfile.accountStatus === 0}>Normal</option>
							<option value="1" selected={props.modProfile.accountStatus === 1}>Limited from Posting</option>
							<option value="2" selected={props.modProfile.accountStatus === 2}>Temp Ban</option>
							<option value="3" selected={props.modProfile.accountStatus === 3}>Permanent Ban</option>
						</select>
					</div>
					<div className="col">
						<label htmlFor="ban_lift_date_picker" className="labels">Banned Until:</label>
						<input type="datetime-local" id="ban_lift_date_picker" name="ban_lift_date" />
						<input type="hidden" id="ban_lift_date" value={props.modProfile.bannedUntil ?? undefined} />
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
						<input id="ban_reason" type="text" className="form-control" placeholder="Ban reason" style={{ width: '100%' }} value={props.modProfile.banReason ?? undefined} />
					</div>
				</div>
				<div className="mt-5 text-center">
					<button className="btn btn-primary profile-button" type="button" data-button-admin-save-pnid={props.modProfile.pid}>Save User</button>
				</div>
			</div>
			<h4>
				Recent Profile Actions (
				{props.auditLogs.length}
				, limit 50 most recent)
			</h4>
			<ul className="list-content-with-icon-and-text arrow-list">
				{props.auditLogs.length === 0 ? <h4>There's nothing here...</h4> : null}
				{props.auditLogs.map(log => (
					<li className="reports">
						<details>
							<summary>
								<div className="hover">
									<a href={`/users/${log.actor.pid}`} className="icon-container notify">
										<img src={url.cdn(`/mii/${log.actor.pid}/normal_face.png`)} className="icon" style={{ width: '32px', height: '32px' }} />
									</a>
									<span className="body messages report">
										<span className="text">
											<a href={`/users/${log.actor.pid}`} className="nick-name">{log.actor.miiName}</a>
											<span title={moment(log.actionAt).toString()} className="timestamp">
												:
												{log.action}
												{' '}
												{moment(log.actionAt).fromNow()}
											</span>
										</span>
									</span>
								</div>
							</summary>
							<span className="text">
								<p style={{ whiteSpace: 'pre-line', padding: '0 30px' }}>{log.context.trim()}</p>
							</span>
						</details>
					</li>
				))}
			</ul>
		</div>
	);
}
