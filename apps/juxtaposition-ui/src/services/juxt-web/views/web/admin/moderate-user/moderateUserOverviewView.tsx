import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { WebAccountStatusEditor } from '@/services/juxt-web/views/web/admin/accountStatusEditor';
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
				<WebAccountStatusEditor modProfile={props.modProfile} />
			</div>
			<h4>
				Recent Profile Actions (
				{props.auditLogs.length}
				, limit 50 most recent)
			</h4>
			<ul className="list-content-with-icon-and-text arrow-list">
				{props.auditLogs.length === 0 ? <p>There's nothing here...</p> : null}
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
