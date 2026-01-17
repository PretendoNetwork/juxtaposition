import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type NewCommunityViewProps = {
	ctx: RenderContext;
};

export function WebNewCommunityView(props: NewCommunityViewProps): ReactNode {
	const head = (
		<>
			<script src="/js/admin.global.js"></script>
			<link rel="stylesheet" href="/css/admin.css" />
			<title>Juxt - New Community</title>
		</>
	);

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header">
				New Community
			</h2>
			<WebNavBar ctx={props.ctx} selection={-1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box community-create">
				<WebModerationTabs ctx={props.ctx} selected="communities" />
				<form action="/admin/communities/new" method="post" encType="multipart/form-data">
					<div className="col-md-4">
						<label className="labels" htmlFor="name">Community Name:</label>
						<input type="text" id="name" name="name" className="form-control" value="" required />
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="description">Description:</label>
						<textarea id="description" name="description" className="form-control" required></textarea>
					</div>
					<div className="col-md-3">
						<label className="labels">Platform</label>
						<select className="form-select" aria-label="Access Mode" name="platform" id="platform">
							<option value="0">Wii U</option>
							<option value="1">3DS</option>
							<option value="2">Both</option>
						</select>
					</div>
					<div className="col-md-3">
						<label className="labels">Type</label>
						<select className="form-select" aria-label="Access Mode" name="type" id="type">
							<option value="0">Main Community</option>
							<option value="1">Sub Community</option>
							<option value="2">Announcement Community</option>
							<option value="3">Private Community</option>
						</select>
					</div>
					<div className="col-md-9">
						<label className="labels" htmlFor="title_ids">Title IDs (comma separated list)</label>
						<input id="title-ids" name="title_ids" type="text" className="form-control" placeholder="1407375153678336, 1407375153685760, 1407375153686016" value="" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="browserIcon">Browser Icon (128px x 128px)</label>
						<input type="file" id="browserIcon" data-image-preview accept="image/jpg" name="browserIcon" />
					</div>
					<div className="col-md-3">
						<img src="" data-image-preview-for="browserIcon" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="CTRbrowserHeader">3DS Browser Banner (400px x 220px)</label>
						<input type="file" id="CTRbrowserHeader" data-image-preview accept="image/jpg" name="CTRbrowserHeader" />
					</div>
					<div className="col-md-3">
						<img src="" data-image-preview-for="CTRbrowserHeader" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="WiiUbrowserHeader">Wii U Browser Banner (1280px x 180px)</label>
						<input type="file" id="WiiUbrowserHeader" data-image-preview accept="image/jpg" name="WiiUbrowserHeader" />
					</div>
					<div className="col-md-3">
						<img src="" data-image-preview-for="WiiUbrowserHeader" />
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="parent">Parent Community ID:</label>
						<input
							type="text"
							id="parent"
							name="parent"
							className="form-control"
							value="null"
						/>
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="app_data">Community App Data:</label>
						<input
							type="text"
							id="app_data"
							name="app_data"
							className="form-control"
							value=""
						/>
					</div>
					<div className="col-md-3">
						<label className="form-check-label" htmlFor="is_recommended">Is Recommended?</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" id="is_recommended" name="is_recommended" />
						</div>
					</div>
					<div className="col-md-3">
						<label className="form-check-label" htmlFor="has_shop_page">Has Shop Page?</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" id="has_shop_page" name="has_shop_page" />
						</div>
					</div>
					<div className="col-md-3">
						<button className="btn btn-primary profile-button" type="submit">Save Community</button>
					</div>
				</form>
			</WebWrapper>
		</WebRoot>
	);
}
