import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { ContentSchema } from '@/models/content';
import type { HydratedReportDocument } from '@/models/report';
import type { PostSchema } from '@/models/post';

export type ReportWithPost = {
	report: HydratedReportDocument;
	post: InferSchemaType<typeof PostSchema>;
};

export type ReportListViewProps = {
	reasonMap: string[];
	userContent: InferSchemaType<typeof ContentSchema>;
	reports: ReportWithPost[];
};

export type ReportProps = {
	reasonMap: string[];
	userContent: InferSchemaType<typeof ContentSchema>;
	report: HydratedReportDocument;
	post: InferSchemaType<typeof PostSchema>;
};

function Report(props: ReportProps): ReactNode {
	const url = useUrl();
	const cache = useCache();
	return (
		<li className="reports">
			<details>
				<summary>
					<div className="hover">
						<span className="icon-container notify">
							<img src={url.cdn(`/mii/${props.report.reported_by}/normal_face.png`)} className="icon" />
						</span>
						<span className="body messages report">
							<span className="text">
								<span className="nick-name">
									Reported By:
									{cache.getUserName(props.report.reported_by)}
								</span>
								<span className="timestamp">{moment(props.report.created_at).fromNow()}</span>
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
					<button evt-click="removeReport(this)" data-id={props.report._id}>Remove Post</button>
					<button evt-click="ignoreReport(this)" data-id={props.report._id}>Ignore Report</button>
				</div>
			</details>
		</li>
	);
}

export function WebReportListView(props: ReportListViewProps): ReactNode {
	const head = <script src="/js/admin.global.js"></script>;

	return (
		<WebRoot head={head}>
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
