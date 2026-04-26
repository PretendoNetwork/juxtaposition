import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
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

function AutomodLogItem({ log }: AutomodLogItemViewProps): ReactNode {
	return (
		<li>
			Test
			{' '}
			{log.id}
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
				logs
				)
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="automod" />
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
