import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { WebSearchBar } from '@/services/juxt-web/views/web/components/ui/WebSearchBar';
import type { ReactNode } from 'react';
import type { HydratedSettingsDocument } from '@/models/settings';

export type UserListViewProps = {
	search?: string;
	userCount: number;
	activeCount: number;
	users: HydratedSettingsDocument[];
	page: number;
};

export function WebUserListView(props: UserListViewProps): ReactNode {
	const url = useUrl();
	const cache = useCache();
	const prevUrl = url.url('/admin/accounts', { page: props.page - 1, search: props.search });
	const nextUrl = url.url('/admin/accounts', { page: props.page + 1, search: props.search });

	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				User Accounts
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="users" />
				<WebSearchBar search={props.search} />
				<span style={{ marginTop: '16px' }}>
					{ props.userCount }
					{' '}
					total user(s),
					{' '}
					{ props.activeCount }
					{' '}
					online user(s)
				</span>
				{props.users.length === 0 ? <p>No Users found</p> : null}
				{props.users.length > 0
					? (
							<>
								<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
									{props.users.map(user => (
										<li key={user.pid}>
											<div className="hover">
												<a href={`/users/${user.pid}`} className="icon-container notify">
													<img src={url.cdn(`/mii/${user.pid}/normal_face.png`)} className="icon" />
												</a>
												<a className="body" href={`/users/${user.pid}`}>
													<span className="text">
														<span className="nick-name">
															{user.pid}
															:
															{' '}
															{cache.getUserName(user.pid)}
														</span>
													</span>
												</a>
											</div>
											<button evt-click="this.children[0].click()"><a id={`account-${user.pid}`} href={`/admin/accounts/${user.pid}`}>Manage User</a></button>
										</li>
									))}
								</ul>
								<div className="buttons tabs">
									{ props.page > 0 ? <a href={prevUrl} className="button">Previous Page</a> : null }
									<a href={nextUrl} className="button">Next Page</a>
								</div>
							</>
						)
					: null}
			</WebWrapper>
		</WebRoot>
	);
}
