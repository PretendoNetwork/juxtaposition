import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { humanDate, humanFromNow } from '@/util';
import { WebMiiIcon } from '@/services/juxt-web/views/web/components/ui/WebMiiIcon';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { HydratedReportDocument } from '@/models/report';
import type { PostSchema } from '@/models/post';
import type { SelfContent } from '@/api/generated';

export type ReportWithPost = {
	report: HydratedReportDocument;
	post: InferSchemaType<typeof PostSchema>;
};

export type ReportListViewProps = {
	reasonMap: string[];
	userContent: SelfContent;
	reports: ReportWithPost[];
};

export type ReportProps = {
	reasonMap: string[];
	userContent: SelfContent;
	report: HydratedReportDocument;
	post: InferSchemaType<typeof PostSchema>;
};

function Report(props: ReportProps): ReactNode {
	const cache = useCache();
	const reporter = props.report.reported_by;

	return (
		<li className="reports">
			<details>
				<summary>
					<div className="hover">
						<WebMiiIcon pid={reporter} type="icon" />
						<span className="body messages report">
							<span className="text">
								<a className="nick-name" href={`/users/${reporter}`}>
									{`Reported by ${cache.getUserName(reporter)}`}
								</a>
								{' - '}
								<span className="pid-display">{reporter}</span>
								{' - '}
								<abbr className="timestamp" title={humanDate(props.report.created_at)}>{humanFromNow(props.report.created_at)}</abbr>
							</span>
							<span className="text">
								<h4>{props.reasonMap[props.report.reason] ?? 'Unknown'}</h4>
								<p>
									{props.report.message}
								</p>
							</span>
						</span>
					</div>
				</summary>
				<WebPostView post={props.post} userContent={props.userContent} isReply={false} />
				<div className="button-spacer">
					<button data-button-admin-remove-report={props.report._id}>Remove Post</button>
					<button data-button-admin-ignore-report={props.report._id}>Ignore Report</button>
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
				)
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
								{props.reports.map(({ report, post }) => (
									<Report key={report.id} userContent={props.userContent} reasonMap={props.reasonMap} post={post} report={report} />
								))}
							</ul>
						)
					: null}
			</WebWrapper>
		</WebRoot>
	);
}
