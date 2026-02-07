import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { CommunitySchema } from '@/models/communities';

export type EditCommunityViewProps = {
	ctx: RenderContext;
	community: InferSchemaType<typeof CommunitySchema>;
};

export function WebEditCommunityView(props: EditCommunityViewProps): ReactNode {
	const community = props.community;
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const head = (
		<>
			<script src="/js/admin.global.js"></script>
			<link rel="stylesheet" href="/css/admin.css" />
			<title>
				Juxt -
				{community.name}
			</title>
		</>
	);

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header">
				Edit Community
			</h2>
			<WebNavBar ctx={props.ctx} selection={-1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box community-create">
				<WebModerationTabs ctx={props.ctx} selected="communities" />
				<form action={`/admin/communities/${community.olive_community_id}`} method="post" encType="multipart/form-data">
					<div className="col-md-4">
						<label className="labels" htmlFor="name">Community Name:</label>
						<input type="text" id="name" name="name" className="form-control" value={community.name} required />
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="description">Description:</label>
						<textarea id="description" name="description" className="form-control" required>{community.description}</textarea>
					</div>
					<div className="col-md-3">
						<label className="labels">Platform</label>
						<select className="form-select" aria-label="Access Mode" name="platform" id="platform">
							<option value="0" selected={community.platform_id === 0}>Wii U</option>
							<option value="1" selected={community.platform_id === 1}>3DS</option>
							<option value="2" selected={community.platform_id === 2}>Both</option>
						</select>
					</div>
					<div className="col-md-3">
						<label className="labels">Type</label>
						<select className="form-select" aria-label="Access Mode" name="type" id="type">
							<option value="0" selected={community.type === 0}>Main Community</option>
							<option value="1" selected={community.type === 1}>Sub Community</option>
							<option value="2" selected={community.type === 2}>Announcement Community</option>
							<option value="3" selected={community.type === 3}>Private Community</option>
						</select>
					</div>
					<div className="col-md-9">
						<label className="labels" htmlFor="title_ids">Title IDs (comma separated list)</label>
						<input id="title-ids" name="title_ids" type="text" className="form-control" placeholder="1407375153678336, 1407375153685760, 1407375153686016" value={community.title_id} />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="browserIcon">Browser Icon (128px x 128px)</label>
						<input type="file" id="browserIcon" data-image-preview accept="image/jpg" name="browserIcon" />
					</div>
					<div className="col-md-3">
						<img src={utils.cdn(props.ctx, `/icons/${imageId}/128.png`)} data-image-preview-for="browserIcon" id="browserIconPreview" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="CTRbrowserHeader">3DS Browser Banner (400px x 220px)</label>
						<input type="file" id="CTRbrowserHeader" data-image-preview accept="image/jpg" name="CTRbrowserHeader" />
					</div>
					<div className="col-md-3">
						{community.ctr_header
							? (
									<img src={utils.cdn(props.ctx, community.ctr_header)} data-image-preview-for="CTRbrowserHeader" id="CTRbrowserHeaderPreview" />
								)
							: (
									<img src={utils.cdn(props.ctx, `/headers/${imageId}/3DS.png`)} data-image-preview-for="CTRbrowserHeader" />
								)}
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="WiiUbrowserHeader">Wii U Browser Banner (1280px x 180px)</label>
						<input type="file" id="WiiUbrowserHeader" data-image-preview accept="image/jpg" name="WiiUbrowserHeader" />
					</div>
					<div className="col-md-3">
						{community.wup_header
							? (
									<img src={utils.cdn(props.ctx, community.wup_header)} data-image-preview-for="WiiUbrowserHeader" id="WiiUbrowserHeaderPreview" />
								)
							: (
									<img src={utils.cdn(props.ctx, `/headers/${imageId}/WiiU.png`)} data-image-preview-for="WiiUbrowserHeader" id="WiiUbrowserHeaderPreview" />
								)}
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="parent">Parent Community ID:</label>
						<input
							type="text"
							id="parent"
							name="parent"
							className="form-control"
							value={community.parent ?? ''}
						/>
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="app_data">Community App Data:</label>
						<input
							type="text"
							id="app_data"
							name="app_data"
							className="form-control"
							value={community.app_data}
						/>
					</div>
					<div className="col-md-3">
						<label className="form-check-label" htmlFor="is_recommended">Is Recommended?</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" id="is_recommended" name="is_recommended" checked={community.is_recommended === 1} />
						</div>
					</div>
					<div className="col-md-3">
						<label className="form-check-label" htmlFor="has_shop_page">Has Shop Page?</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" id="has_shop_page" name="has_shop_page" checked={community.has_shop_page === 1} />
						</div>
					</div>
					<div className="col-md-3" style={{ justifyContent: 'center' }}>
						<button className="btn btn-primary profile-button" type="submit">
							Save Community
						</button>
					</div>
				</form>
			</WebWrapper>
		</WebRoot>
	);
}
