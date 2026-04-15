import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { WebSearchBar } from '@/services/juxt-web/views/web/components/ui/WebSearchBar';
import type { ReactNode } from 'react';
import type { AdminCommunity } from '@/api/generated';

export type ManageCommunityViewProps = {
	search?: string;
	communities: AdminCommunity[];
	hasNextPage: boolean;
	page: number;
};

export function WebManageCommunityView(props: ManageCommunityViewProps): ReactNode {
	const url = useUrl();
	const prevUrl = url.url('/admin/communities', { page: props.page - 1, search: props.search });
	const nextUrl = url.url('/admin/communities', { page: props.page + 1, search: props.search });

	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				Manage Communities
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="communities" />
				<WebSearchBar search={props.search} />
				<button style={{ marginTop: '1em' }}>
					<a href="/admin/communities/new" className="button">Create Community</a>
				</button>
				{props.communities.length === 0 ? <p>No Communities found</p> : null}
				{props.communities.length > 0
					? (
							<>
								<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
									{props.communities.map(community => (
										<li key={community.id}>
											<div className="hover">
												<a href={`/communities/${community.olive_community_id}`} className="icon-container notify">
													<img src={url.cdn(`/icons/${community.olive_community_id}/128.png`)} className="icon" />
												</a>
												<a className="body" href={`/communities/${community.olive_community_id}`}>
													<span className="text"><span className="nick-name">{community.name}</span></span>
												</a>
											</div>
											<button evt-click="this.children[0].click()"><a id={`account-${community.id}`} href={`/admin/communities/${community.olive_community_id}`}>Manage Community</a></button>
										</li>
									))}
								</ul>
								<div className="buttons tabs">
									{ props.page > 0 ? <a href={prevUrl} className="button">Previous Page</a> : null }
									{ props.hasNextPage ? <a href={nextUrl} className="button">Next Page</a> : null }
								</div>
							</>
						)
					: null }
			</WebWrapper>
		</WebRoot>
	);
}
