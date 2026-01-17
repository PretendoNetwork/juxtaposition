import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { utils } from '@/services/juxt-web/views/utils';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ContentSchema } from '@/models/content';
import type { HydratedReportDocument } from '@/models/report';
import type { PostSchema } from '@/models/post';

export type ReportListViewProps = {
	ctx: RenderContext;
	reasonMap: string[];
	userContent: InferSchemaType<typeof ContentSchema>;
	reports: HydratedReportDocument[];
	posts: InferSchemaType<typeof PostSchema>[];
};

export type ReportProps = {
	ctx: RenderContext;
	reasonMap: string[];
	userContent: InferSchemaType<typeof ContentSchema>;
	report: HydratedReportDocument;
	post: InferSchemaType<typeof PostSchema>;
};

function Report(props: ReportProps): ReactNode {
	return (
		<li className="reports">
			<details>
				<summary>
					<div className="hover">
						<span data-pjax="#body" className="icon-container notify">
							<img src={utils.cdn(props.ctx, `/mii/${props.report.reported_by}/normal_face.png`)} className="icon" />
						</span>
						<span className="body messages report">
							<span className="text">
								<span className="nick-name">
									Reported By:
									{props.ctx.usersMap.get(props.report.reported_by)}
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
				<WebPostView ctx={props.ctx} post={props.post} userContent={props.userContent} isReply={false} />
				<div className="button-spacer">
					<button evt-click="removeReport(this)" data-id="<%=report._id%>">Remove Post</button>
					<button evt-click="ignoreReport(this)" data-id="<%=report._id%>">Ignore Report</button>
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
				User Reports
			</h2>
			<WebNavBar ctx={props.ctx} selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs ctx={props.ctx} selected="reports" />
				{props.reports.length === 0 ? <p>No Reports found</p> : null }
				{props.reports.length > 0
					? (
							<ul className="list-content-with-icon-and-text arrow-list" id="news-list-content">
								{props.reports.map((report) => {
									const post = props.posts.find(post => post.id === report.post_id);
									if (!post) {
										return <React.Fragment key={report.id} />;
									}
									return <Report ctx={props.ctx} key={report.id} userContent={props.userContent} reasonMap={props.reasonMap} post={post} report={report} />;
								})}
							</ul>
						)
					: null}
			</WebWrapper>
		</WebRoot>
	);
}
