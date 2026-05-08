import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { humanDate, humanFromNow } from '@/util';
import { WebMiiIcon } from '@/services/juxt-web/views/web/components/ui/WebMiiIcon';
import type { ReactNode } from 'react';
import type { Report, SelfContent } from '@/api/generated';

export type ReportListViewProps = {
	reasonMap: string[];
	userContent: SelfContent;
	reports: Report[];
};

export type ReportProps = {
	reasonMap: string[];
	userContent: SelfContent;
	report: Report;
};

function Report(props: ReportProps): ReactNode {
	const cache = useCache();
	const createdAt = new Date(props.report.createdAt);
	const reporter = props.report.reporter;

	return (
		<li className="reports">
			<details>
				<summary>
					<div className="hover">
						<WebMiiIcon pid={reporter.pid} type="icon" />
						<span className="body messages report">
							<span className="text">
								<a className="nick-name" href={`/users/${reporter.pid}`}>
									{`Reported by ${cache.getUserName(reporter.pid)}`}
								</a>
								{' - '}
								<span className="pid-display">{reporter.pid}</span>
								{' - '}
								<abbr className="timestamp" title={humanDate(createdAt)}>{humanFromNow(createdAt)}</abbr>
							</span>
							<span className="text">
								<h4>{props.reasonMap[reporter.reasonId] ?? 'Unknown'}</h4>
								<p>
									{reporter.message}
								</p>
							</span>
						</span>
					</div>
				</summary>
				<WebPostView post={props.report.post} userContent={props.userContent} isReply={false} />
				<div className="button-spacer">
					<button data-button-admin-remove-report={props.report.id}>Remove Post</button>
					<button data-button-admin-ignore-report={props.report.id}>Ignore Report</button>
				</div>
			</details>
		</li>
	);
}

export function WebReportListView(props: ReportListViewProps): ReactNode {
	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				User Reports (
				{props.reports.length}
				/150)
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="reports" />
				{props.reports.length === 0
					? (
							<p>
								All reports handled 🎉
								<br />
								Good job team!
							</p>
						)
					: null }
				{props.reports.length > 0
					? (
							<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
								{props.reports.map(report => (
									<Report key={report.id} userContent={props.userContent} reasonMap={props.reasonMap} report={report} />
								))}
							</ul>
						)
					: null}
			</WebWrapper>
		</WebRoot>
	);
}
