import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { WebMiiIcon } from '@/services/juxt-web/views/web/components/ui/WebMiiIcon';
import { humanDate, humanFromNow } from '@/util';
import type { ReactNode } from 'react';
import type { AutomodLog } from '@/api/generated';

export type AutomodLogItemViewProps = {
	log: AutomodLog;
};

export type AutomodLogListViewProps = {
	total: number;
	items: AutomodLog[];
	page: number;
	hasNextPage: boolean;
};

export function AutomodLogItem({ log }: AutomodLogItemViewProps): ReactNode {
	return (
		<li className="reports">
			<div className="hover">
				<WebMiiIcon pid={log.postAuthor?.pid} type="icon" />
				<span className="body messages report">
					<span className="text">
						{`Post ${log.action} by `}
						<a className="nick-name" href={`/users/${log.postAuthor?.pid}`}>
							{log.postAuthor?.miiName}
						</a>
						{' - '}
						<span className="pid-display">{log.postAuthor?.pid}</span>
						{' - '}
						<abbr className="timestamp" title={humanDate(log.createdAt)}>{humanFromNow(log.createdAt)}</abbr>
					</span>
					<span className="text">
						<p>
							<span className="pid-display">Triggered by </span>
							<span>{log.rule.title}</span>
						</p>
					</span>
					<span className="text">
						<h4>Body:</h4>
						<p>
							{log.postContent?.body ?? 'NO BODY'}
						</p>
					</span>
				</span>
			</div>
			<div className="button-spacer">
				{ log.postId ? <a href={`/posts/${log.postId}`}>Go to post</a> : null }
			</div>
		</li>
	);
}

export function WebAutomodLogListView(props: AutomodLogListViewProps): ReactNode {
	const url = useUrl();
	const prevUrl = url.url('/admin/automod', { page: props.page - 1 });
	const nextUrl = url.url('/admin/automod', { page: props.page + 1 });

	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				Automod (
				{props.total}
				{' '}
				logs)
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="automod" />
				<button style={{ marginTop: '1em' }}>
					<a href="/admin/automod/rules" className="button">View rules</a>
				</button>
				{props.items.length === 0
					? (
							<p>
								No logs found
							</p>
						)
					: null }
				<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
					{props.items.map(log => (
						<AutomodLogItem log={log} key={log.id} />
					))}
				</ul>
				<div className="buttons tabs">
					{ props.page > 0 ? <a href={prevUrl} className="button">Previous Page</a> : null }
					{ props.hasNextPage ? <a href={nextUrl} className="button">Next Page</a> : null }
				</div>
			</WebWrapper>
		</WebRoot>
	);
}
