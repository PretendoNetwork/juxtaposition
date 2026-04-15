import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { Community } from '@/models/community';
import { CommunityShotModes } from '@/types/mongoose/community';
import { errors } from '@/services/internal/errors';
import { buildSearchQuery } from '@/services/internal/utils/search';
import { adminCommunitySchema, mapAdminCommunity } from '@/services/internal/contract/admin/adminCommunity';
import { uploadHeaders, uploadIcons } from '@/images';
import { communityPlatformDisplayMap, communityTypeDisplayMap, generateCommunityId } from '@/services/internal/utils/communities';
import { createLogEntry } from '@/services/internal/utils/auditLogs';
import { deleteOptional } from '@/services/internal/utils';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import type { FilterQuery } from 'mongoose';
import type { HeaderUrls, IconUrls } from '@/images';
import type { ICommunity, IIconPaths } from '@/types/mongoose/community';

export const adminCommunitiesRouter = createInternalApiRouter();

const communityCreateSchema = z.object({
	hasShopPage: z.boolean().transform(v => v ? 1 : 0),
	isRecommended: z.boolean().transform(v => v ? 1 : 0),
	platform: z.union([
		z.literal(0), // Wii U
		z.literal(1), // 3DS
		z.literal(2) // Both
	]),
	name: z.string(),
	description: z.string(),
	parent: z.string().nullable(),
	type: z.union([
		z.literal(0), // Main Community
		z.literal(1), // Sub Community
		z.literal(2), // Announcement Community
		z.literal(3) // Private Community
	]),
	titleIds: z.array(z.string()),
	appData: z.string(),
	shotMode: z.enum(CommunityShotModes),
	shotModeExtraTitleIds: z.array(z.string()),
	browserIcon: z.base64(),
	ctrBrowserHeader: z.base64(),
	wiiuBrowserHeader: z.base64()
});

adminCommunitiesRouter.get({
	path: '/admin/communities',
	name: 'admin.communities.list',
	guard: guards.developer,
	schema: {
		query: z.object({
			search: z.string().optional(),
			sort: standardSortSchema
		}).extend(pageControlSchema()),
		response: pageDtoSchema(adminCommunitySchema)
	},
	async handler({ query }) {
		const dbQuery: FilterQuery<ICommunity> = {
			$and: [
				{
					parent: null
				},
				query.search ? buildSearchQuery<ICommunity>(['name'], query.search) : {}
			]
		};
		const communities = await Community
			.find(dbQuery)
			.sort({ created_at: standardSortToDirection(query.sort) })
			.skip(query.offset)
			.limit(query.limit);
		const total = await Community.countDocuments(dbQuery);

		return mapPage(total, communities.map(c => mapAdminCommunity(c)));
	}
});

adminCommunitiesRouter.get({
	path: '/admin/communities/:id',
	name: 'admin.communities.get',
	guard: guards.developer,
	schema: {
		params: z.object({
			id: z.string()
		}),
		response: adminCommunitySchema
	},
	async handler({ params }) {
		const community = await Community.findOne({ olive_community_id: params.id });
		if (!community) {
			throw new errors.notFound('Not found');
		}

		return mapAdminCommunity(community);
	}
});

adminCommunitiesRouter.post({
	path: '/admin/communities',
	name: 'admin.communities.create',
	guard: guards.developer,
	schema: {
		body: communityCreateSchema,
		response: adminCommunitySchema
	},
	async handler({ body, auth }) {
		const pnid = auth!.pnid;

		const communityId = await generateCommunityId();
		const icons = await uploadIcons({
			icon: Buffer.from(body.browserIcon, 'base64'),
			communityId
		});
		const headers = await uploadHeaders({
			ctr_header: Buffer.from(body.ctrBrowserHeader, 'base64'),
			wup_header: Buffer.from(body.wiiuBrowserHeader, 'base64'),
			communityId
		});
		if (icons === null || headers === null) {
			throw new errors.badRequest('Failed to parse/upload images');
		}

		const iconPaths: IIconPaths = {
			32: icons.icon32,
			48: icons.icon48,
			64: icons.icon64,
			96: icons.icon96,
			128: icons.icon128
		};
		const community = await Community.create({
			platform_id: body.platform,
			name: body.name,
			description: body.description,
			open: true,
			allows_comments: true,
			type: body.type,
			parent: body.parent,
			owner: pnid.pid,
			created_at: new Date(),
			empathy_count: 0,
			followers: 0,
			has_shop_page: body.hasShopPage,
			icon: icons.tgaBlob,
			ctr_header: headers.ctr,
			wup_header: headers.wup,
			icon_paths: iconPaths,
			title_id: body.titleIds,
			community_id: communityId,
			olive_community_id: communityId,
			is_recommended: body.isRecommended,
			app_data: body.appData,
			shot_mode: body.shotMode,
			shot_extra_title_id: body.shotModeExtraTitleIds
		});

		const communityType = communityTypeDisplayMap[community.type] ?? `Unknown ${community.type}`;
		const communityPlatform = communityPlatformDisplayMap[community.platform_id] ?? `Unknown ${community.platform_id}`;
		const changes = [];

		changes.push(`Name set to "${community.name}"`);
		changes.push(`Description set to "${community.description}"`);
		changes.push(`Platform ID set to "${communityPlatform}"`);
		changes.push(`Type set to "${communityType}"`);
		changes.push(`Title IDs set to "${community.title_id.join(', ')}"`);
		changes.push(`Parent set to "${community.parent}"`);
		changes.push(`App data set to "${community.app_data}"`);
		changes.push(`Is Recommended set to "${community.is_recommended}"`);
		changes.push(`Has Shop Page set to "${community.has_shop_page}"`);

		await createLogEntry({
			actorId: pnid.pid,
			action: 'MAKE_COMMUNITY',
			targetResourceId: communityId,
			context: changes.join('\n'),
			fields: [
				'name',
				'description',
				'platform_id',
				'type',
				'title_id',
				'browserIcon',
				'CTRbrowserHeader',
				'WiiUbrowserHeader',
				'parent',
				'app_data',
				'is_recommended',
				'has_shop_page'
			]
		});

		return mapAdminCommunity(community);
	}
});

adminCommunitiesRouter.patch({
	path: '/admin/communities/:id',
	name: 'admin.communities.update',
	guard: guards.developer,
	schema: {
		params: z.object({
			id: z.string()
		}),
		body: communityCreateSchema.partial(),
		response: adminCommunitySchema
	},
	async handler({ body, params, auth }) {
		const pnid = auth!.pnid;
		const communityId = params.id;
		const oldCommunity = await Community.findOne({ olive_community_id: params.id });
		if (!oldCommunity) {
			throw new errors.notFound('Not found');
		}

		let icons: IconUrls | null = null;
		if (body.browserIcon) {
			icons = await uploadIcons({
				icon: Buffer.from(body.browserIcon, 'base64'),
				communityId
			});
			if (icons === null) {
				throw new errors.badRequest('Failed to parse/upload images');
			}
		}
		let headers: HeaderUrls | null = null;
		if (body.ctrBrowserHeader && body.wiiuBrowserHeader) {
			headers = await uploadHeaders({
				ctr_header: Buffer.from(body.ctrBrowserHeader, 'base64'),
				wup_header: Buffer.from(body.wiiuBrowserHeader, 'base64'),
				communityId
			});
			if (headers === null) {
				throw new errors.badRequest('Failed to parse/upload images');
			}
		}

		const iconPaths: IIconPaths | undefined = icons
			? {
					32: icons.icon32,
					48: icons.icon48,
					64: icons.icon64,
					96: icons.icon96,
					128: icons.icon128
				}
			: undefined;
		const comm = await Community.findOneAndUpdate({ olive_community_id: communityId }, {
			$set: deleteOptional({
				type: body.type,
				has_shop_page: body.hasShopPage,
				platform_id: Number(body.platform),
				icon: icons?.tgaBlob ?? oldCommunity.icon,
				icon_paths: iconPaths,
				ctr_header: headers?.ctr ?? oldCommunity.ctr_header,
				wup_header: headers?.wup ?? oldCommunity.wup_header,
				title_id: body.titleIds,
				parent: body.parent,
				app_data: body.appData,
				is_recommended: body.isRecommended,
				name: body.name,
				description: body.description,
				shot_mode: body.shotMode,
				shot_extra_title_id: body.shotModeExtraTitleIds
			})
		});
		if (!comm) {
			throw new Error('Can not find community after update');
		}

		// determine the changes made to the community
		const changes = [];
		const fields = [];

		if (oldCommunity.name !== comm.name) {
			fields.push('name');
			changes.push(`Name changed from "${oldCommunity.name}" to "${comm.name}"`);
		}
		if (oldCommunity.description !== comm.description) {
			fields.push('description');
			changes.push(`Description changed from "${oldCommunity.description}" to "${comm.description}"`);
		}
		if (oldCommunity.platform_id !== comm.platform_id) {
			const oldCommunityPlatform = communityPlatformDisplayMap[oldCommunity.platform_id] ?? `Unknown ${oldCommunity.platform_id}`;
			const newCommunityPlatform = communityPlatformDisplayMap[comm.platform_id] ?? `Unknown ${comm.platform_id}`;
			fields.push('platform_id');
			changes.push(`Platform ID changed from "${oldCommunityPlatform}" to "${newCommunityPlatform}"`);
		}
		if (oldCommunity.type !== comm.type) {
			const oldCommunityType = communityTypeDisplayMap[oldCommunity.type] ?? `Unknown ${oldCommunity.type}`;
			const newCommunityType = communityTypeDisplayMap[comm.type] ?? `Unknown ${comm.type}`;
			fields.push('type');
			changes.push(`Type changed from "${oldCommunityType}" to "${newCommunityType}"`);
		}
		if (oldCommunity.title_id.toString() !== comm.title_id.toString()) {
			fields.push('title_id');
			changes.push(`Title IDs changed from "${oldCommunity.title_id.join(', ')}" to "${comm.title_id.join(', ')}"`);
		}
		if (body.browserIcon) {
			fields.push('browserIcon');
			changes.push('Icon changed');
		}
		if (body.ctrBrowserHeader) {
			fields.push('CTRbrowserHeader');
			changes.push('3DS Banner changed');
		}
		if (body.wiiuBrowserHeader) {
			fields.push('WiiUbrowserHeader');
			changes.push('Wii U Banner changed');
		}
		if (oldCommunity.parent !== comm.parent) {
			fields.push('parent');
			changes.push(`Parent changed from "${oldCommunity.parent}" to "${comm.parent}"`);
		}
		if (oldCommunity.app_data !== comm.app_data) {
			fields.push('app_data');
			changes.push(`App data changed from "${oldCommunity.app_data}" to "${comm.app_data}"`);
		}
		if (oldCommunity.is_recommended !== comm.is_recommended) {
			fields.push('is_recommended');
			changes.push(`Is Recommended changed from "${oldCommunity.is_recommended}" to "${comm.is_recommended}"`);
		}
		if (oldCommunity.has_shop_page !== comm.has_shop_page) {
			fields.push('has_shop_page');
			changes.push(`Has Shop Page changed from "${oldCommunity.has_shop_page}" to "${comm.has_shop_page}"`);
		}

		if (changes.length > 0) {
			await createLogEntry({
				actorId: pnid.pid,
				action: 'UPDATE_COMMUNITY',
				targetResourceId: oldCommunity.olive_community_id,
				context: changes.join('\n'),
				fields
			});
		}

		return mapAdminCommunity(comm);
	}
});

adminCommunitiesRouter.delete({
	path: '/admin/communities/:id',
	name: 'admin.communities.delete',
	guard: guards.developer,
	schema: {
		params: z.object({
			id: z.string()
		}),
		response: resultSchema
	},
	async handler({ params, auth }) {
		const pnid = auth!.pnid;
		const result = await Community.deleteOne({ olive_community_id: params.id });
		if (result.deletedCount === 0) {
			throw new errors.notFound('Not found');
		}

		await createLogEntry({
			actorId: pnid.pid,
			action: 'DELETE_COMMUNITY',
			targetResourceId: params.id,
			context: `Community ${params.id} deleted`
		});

		return mapResult('success');
	}
});
