import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { AdminCommunity } from '@/api/generated';

export type EditCommunityViewProps = {
	community: AdminCommunity;
};

export function WebEditCommunityView(props: EditCommunityViewProps): ReactNode {
	const url = useUrl();
	const community = props.community;
	const head = (
		<>
			<title>
				Juxt -
				{community.name}
			</title>
		</>
	);

	return (
		<WebRoot type="admin" head={head}>
			<h2 id="title" className="page-header">
				Edit Community
			</h2>
			<WebNavBar selection={-1} />
			<div id="toast"></div>
			<WebWrapper className="community-page-post-box community-create">
				<WebModerationTabs selected="communities" />
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
							<option value="0" selected={community.platformId === 0}>Wii U</option>
							<option value="1" selected={community.platformId === 1}>3DS</option>
							<option value="2" selected={community.platformId === 2}>Both</option>
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
						<label className="labels" htmlFor="title_ids">Title IDs (hex)</label>
						<textarea rows={10} data-input-admin-title-ids="#title-ids"></textarea>
						<input id="title-ids" name="title_ids" type="hidden" value={community.titleIds} />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="browserIcon">Browser Icon (128px x 128px)</label>
						<input type="file" id="browserIcon" data-image-preview accept="image/png" name="browserIcon" />
					</div>
					<div className="col-md-3">
						<img src={url.cdn(community.iconImagePaths['128'])} data-image-preview-for="browserIcon" id="browserIconPreview" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="CTRbrowserHeader">3DS Browser Banner (400px x 220px)</label>
						<input type="file" id="CTRbrowserHeader" data-image-preview accept="image/png" name="CTRbrowserHeader" />
					</div>
					<div className="col-md-3">
						<img src={url.cdn(community.ctrHeaderImagePath)} data-image-preview-for="CTRbrowserHeader" id="CTRbrowserHeaderPreview" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="WiiUbrowserHeader">Wii U Browser Banner (1280px x 180px)</label>
						<input type="file" id="WiiUbrowserHeader" data-image-preview accept="image/png" name="WiiUbrowserHeader" />
					</div>
					<div className="col-md-3">
						<img src={url.cdn(community.wupHeaderImagePath)} data-image-preview-for="WiiUbrowserHeader" id="WiiUbrowserHeaderPreview" />
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="parent">Parent Community ID:</label>
						<input
							type="text"
							id="parent"
							name="parent"
							className="form-control"
							value={community.parentId ?? ''}
						/>
					</div>
					<div className="col-md-4">
						<label className="labels" htmlFor="app_data">Community App Data:</label>
						<input
							type="text"
							id="app_data"
							name="app_data"
							className="form-control"
							value={community.appData}
						/>
					</div>
					<div className="col-md-3">
						<label className="form-check-label" htmlFor="is_recommended">Is Recommended?</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" id="is_recommended" name="is_recommended" checked={community.isRecommended} />
						</div>
					</div>
					<div className="col-md-3">
						<label className="form-check-label" htmlFor="has_shop_page">Has Shop Page?</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" id="has_shop_page" name="has_shop_page" checked={community.hasShopPage} />
						</div>
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="shot_mode">Screenshot mode</label>
						<select className="form-select" name="shot_mode" id="shot_mode">
							<option value="allow" selected={community.shotMode === 'allow'}>Allow this game only (Default)</option>
							<option value="block" selected={community.shotMode === 'block'}>Block all</option>
							<option value="force" selected={community.shotMode === 'force'}>Allow, even if game disallows</option>
						</select>
					</div>
					<div className="col-md-9">
						<label className="labels" htmlFor="shot_extra_title_id">Extra screenshot titles (comma separated list)</label>
						<textarea rows={10} data-input-admin-title-ids="#shot-extra-title-ids"></textarea>
						<input id="shot-extra-title-ids" name="shot_extra_title_id" type="hidden" value={community.extraShotTitleIds} />
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
