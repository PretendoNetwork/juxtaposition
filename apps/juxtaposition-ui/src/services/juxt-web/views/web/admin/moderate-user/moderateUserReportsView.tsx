import moment from 'moment';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { AutomodLogItem } from '@/services/juxt-web/views/web/admin/automodLogListView';
import type { ReactNode } from 'react';
import type { AutomodLog, Report } from '@/api/generated';

export type ModerateUserReportsListViewProps = {
	reports: Report[];
	submittedReports: Report[];
	automodLogs: AutomodLog[];
	reasonMap: string[];
};

type ModerateUserReportProps = {
	report: Report;
	reasonMap: string[];
};

function ModerateUserReportView(props: ModerateUserReportProps): ReactNode {
	const { reporter, resolved } = props.report;
	const createdAt = new Date(props.report.createdAt);
	const url = useUrl();

	return (
		<li key={props.report.id} className="reports">
			<details>
				<summary>
					<div className="hover">
						<a href={`/users/${reporter.pid}`} className="icon-container notify">
							<img src={url.cdn(`/mii/${reporter.pid}/normal_face.png`)} className="icon" />
						</a>
						<span className="body messages report">
							<span className="text">
								<a href={`/users/${reporter.pid}`} className="nick-name">
									Reported By:
									{' '}
									{reporter.user?.miiName ?? 'Unknown'}
								</a>
								{'  '}
								<span title={moment(createdAt).toString()} className="timestamp">{moment(createdAt).fromNow()}</span>
							</span>
							<span className="text">
								<h4>
									{props.reasonMap[reporter.reasonId] ?? 'Unknown'}
								</h4>
								<p>
									{reporter.message}
								</p>
							</span>
							{ resolved.isResolved && resolved.reason === 'similarReportResolved'
								? (
										<>
											<span className="text">
												Resolved by similar report
											</span>
										</>
									)
								: resolved.isResolved
									? (
											<>
												<span className="text">
													<span className="nick-name">
														Resolved By:
														{' '}
														{resolved.pid ? resolved.user?.miiName : 'Nobody'}
													</span>
													{'  '}
													<span title={moment(resolved.resolvedAt).toString()} className="timestamp">{moment(resolved.resolvedAt).fromNow()}</span>
												</span>
												<span className="text"><p>{resolved.note}</p></span>
											</>
										)
									: null}
						</span>
					</div>
				</summary>
				{ props.report.post ? <WebPostView post={props.report.post} isReply={false} /> : <p>Post could not be found</p> }
			</details>
		</li>
	);
}

export function ModerateUserReportsListView(props: ModerateUserReportsListViewProps): ReactNode {
	return (
		<div>
			<details open>
				<summary>
					<div className="mt-5">
						<h4>
							Recently Reported Posts (
							{props.reports.length}
							, limit 50 most recent)
						</h4>
					</div>
				</summary>
				<ul className="list-content-with-icon-and-text arrow-list">
					{props.reports.length === 0 ? <h4>There's nothing here...</h4> : null}
					{props.reports.map(report => <ModerateUserReportView key={report.id} report={report} reasonMap={props.reasonMap} />) }
				</ul>
			</details>
			<details>
				<summary>
					<div className="mt-5">
						<h4>
							Recently Submitted Reports (
							{props.submittedReports.length}
							, limit 50 most recent)
						</h4>
					</div>
				</summary>
				<ul className="list-content-with-icon-and-text arrow-list">
					{props.submittedReports.length === 0 ? <h4>There's nothing here...</h4> : null}
					{props.submittedReports.map(report => <ModerateUserReportView key={report.id} report={report} reasonMap={props.reasonMap} />) }
				</ul>
			</details>
			<details>
				<summary>
					<div className="mt-5">
						<h4>
							Recent Automod Events (
							{props.automodLogs.length}
							, limit 50 most recent)
						</h4>
					</div>
				</summary>
				<ul className="list-content-with-icon-and-text arrow-list accounts">
					{props.automodLogs.length === 0 ? <h4>There's nothing here...</h4> : null}
					{props.automodLogs.map(log => <AutomodLogItem key={log.id} log={log} />) }
				</ul>
			</details>
		</div>
	);
}
