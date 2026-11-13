import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import type { ReactNode } from 'react';

export function WebAnnouncementCreateView(): ReactNode {
	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				New announcement
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper className="community-create">
				<WebModerationTabs selected="automod" />
				<form action="/admin/announcements/create" method="post">
					<div className="col-md-3">
						<label className="labels" htmlFor="type">Announcement type</label>
						<select className="form-select" value="system" name="type" id="type">
							<option value="system">System</option>
							<option value="changelog">Changelog</option>
						</select>
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="text">Text</label>
						<textarea id="text" name="text" className="form-control" value="" placeholder="Lorem ipsum..." required />
					</div>
					<div className="col-md-3">
						<button className="btn btn-primary profile-button" type="submit">Send announcement</button>
					</div>
				</form>
			</WebWrapper>
		</WebRoot>
	);
}
