import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebAdminCenterItems, WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { humanDate, humanFromNow } from '@/util';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import type { ReactNode } from 'react';
import type { AdminAnnouncement } from '@/api/generated';

export type AnnouncementItemViewProps = {
	announcement: AdminAnnouncement;
};

export type AnnouncementListViewProps = {
	announcements: AdminAnnouncement[];
	page: number;
};

function AnnouncementContent(props: { notif: AdminAnnouncement['notif'] }): ReactNode {
	if (props.notif.type === 'system') {
		return <p>{props.notif.content.text}</p>;
	}

	return <p>CANT RENDER ANNOUNCEMENT</p>;
}

function WebAnnouncementItemView(props: AnnouncementItemViewProps): ReactNode {
	const user = useUser();
	const announcement = props.announcement;
	return (
		<li className="reports">
			<div className="hover">
				<div className="body messages report">
					<span className="text">
						<span>{announcement.notif.type}</span> - <abbr className="timestamp" title={humanDate(announcement.createdAt)}>{humanFromNow(announcement.createdAt)}</abbr>
					</span>
					<div className="text">
						<AnnouncementContent notif={announcement.notif} />
					</div>
				</div>
			</div>
			<div className="button-spacer">
				{ user.perms.developer
					? (
							<form action="/admin/announcements/delete" method="post" evt-click="return confirm('Delete announcement?')">
								<input type="hidden" value={announcement.id} name="id" />
								<button>Delete</button>
							</form>
						)
					: null }
			</div>
		</li>
	);
}

export function WebAnnouncementListView(props: AnnouncementListViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	const prevUrl = url.url('/admin/announcements', { page: props.page - 1 });
	const nextUrl = url.url('/admin/announcements', { page: props.page + 1 });

	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				Announcements
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="announcements" />
				<WebAdminCenterItems>
					{ user.perms.developer
						? (
								<button style={{ marginTop: '1em' }}>
									<a href="/admin/announcements/create" className="button">New announcement</a>
								</button>
							)
						: null }
					{props.announcements.length === 0 ? <p>No announcements found</p> : null}
				</WebAdminCenterItems>
				{props.announcements.length > 0
					? (
							<>
								<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
									{props.announcements.map(announcement => (
										<WebAnnouncementItemView key={announcement.id} announcement={announcement} />
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
