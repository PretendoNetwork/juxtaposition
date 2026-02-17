import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { CommunityDto } from '@/api/community';

export type ManageCommunityViewProps = {
	ctx: RenderContext;
	search?: string;
	communities: CommunityDto[];
	hasNextPage: boolean;
	page: number;
};

export function WebManageCommunityView(props: ManageCommunityViewProps): ReactNode {
	const head = <script src="/js/admin.global.js"></script>;
	const prevUrl = utils.url('/admin/communities', { page: props.page - 1, search: props.search });
	const nextUrl = utils.url('/admin/communities', { page: props.page + 1, search: props.search });

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header">
				Manage Communities
			</h2>
			<WebNavBar ctx={props.ctx} selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs ctx={props.ctx} selected="communities" />
				<input type="string" id="community-search" className="searchbar" placeholder="Search..." value={props.search} />
				<button style={{ marginTop: '1em' }}>
					<a href="/admin/communities/new" className="button">Create Community</a>
				</button>
				{props.communities.length === 0 ? <p>No Communities found</p> : null}
				{props.communities.length > 0
					? (
							<>
								<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
									{props.communities.map(community => (
										<li key={community.community_id}>
											<div className="hover">
												<a href={`/communities/${community.olive_community_id}`} data-pjax="#body" className="icon-container notify">
													<img src={utils.cdn(props.ctx, `/icons/${community.olive_community_id}/128.png`)} className="icon" />
												</a>
												<a className="body" href={`/communities/${community.olive_community_id}`}>
													<span className="text"><span className="nick-name">{community.name}</span></span>
												</a>
											</div>
											<button evt-click="this.children[0].click()"><a id={`account-${community.community_id}`} href={`/admin/communities/${community.olive_community_id}`}>Manage Community</a></button>
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
