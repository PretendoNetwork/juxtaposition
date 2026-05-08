import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { standardSortSchema, standardSortToDirection } from '@/services/internal/contract/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { Community } from '@/models/community';
import { deleteOptional } from '@/services/internal/utils';
import { COMMUNITY_TYPE } from '@/types/mongoose/community';
import { categoryToCommunityTypes, communityCategory, communitySchema, communityStatsSchema, mapCommunity, mapCommunityStats } from '@/services/internal/contract/community';
import { errors } from '@/services/internal/errors';
import { Post } from '@/models/post';
import { listDtoSchema, mapList } from '@/services/internal/contract/list';
import type { FilterQuery, RootFilterQuery } from 'mongoose';
import type { ICommunity, HydratedCommunityDocument } from '@/types/mongoose/community';

const popularRangeMs = 24 * 60 * 60 * 1000; // 24h

export const communitiesRouter = createInternalApiRouter();

communitiesRouter.get({
	path: '/communities',
	name: 'communities.list',
	guard: guards.guest,
	schema: {
		query: z.object({
			sort: standardSortSchema,
			parent_id: z.string().optional(),
			category: communityCategory.optional()
		}).extend(pageControlSchema(90)),
		response: pageDtoSchema(communitySchema)
	},
	async handler({ query, auth }) {
		const typesToFilter: RootFilterQuery<ICommunity> = auth?.moderator
			? {}
			: {
					type: {
						$ne: COMMUNITY_TYPE.Private
					}
				};
		if (query.category) {
			let typeList = categoryToCommunityTypes(query.category);
			if (!auth?.moderator) {
				typeList = typeList.filter(v => v !== COMMUNITY_TYPE.Private);
			}
			typesToFilter.type = typeList;
		}

		const dbQuery: FilterQuery<ICommunity> = deleteOptional({
			parent: query.parent_id,
			...typesToFilter
		});
		const communities = await Community
			.find(dbQuery)
			.sort({ created_at: standardSortToDirection(query.sort) })
			.skip(query.offset)
			.limit(query.limit);
		const total = await Community.countDocuments(dbQuery);

		return mapPage(total, communities.map(c => mapCommunity(c)));
	}
});

communitiesRouter.get({
	path: '/communities/popular',
	name: 'communities.listPopular',
	guard: guards.guest,
	schema: {
		query: z.object({
			limit: z.coerce.number().max(32).default(9)
		}),
		response: listDtoSchema(communitySchema)
	},
	async handler({ query }) {
		// TODO add caching
		const popularCommunityIds = await calculateMostPopularCommunities(popularRangeMs);
		const popularCommunities = await Community.aggregate<HydratedCommunityDocument>([
			{
				$match: {
					type: { $in: [COMMUNITY_TYPE.Main, COMMUNITY_TYPE.Announcement] },
					olive_community_id: { $in: popularCommunityIds },
					parent: null
				}
			},
			{
				$addFields: {
					index: { $indexOfArray: [popularCommunityIds, '$olive_community_id'] }
				}
			},
			{ $sort: { index: 1 } },
			{ $limit: query.limit },
			{ $project: { index: 0, _id: 0 } }
		]);

		return mapList(popularCommunities.map(c => mapCommunity(c)));
	}
});

communitiesRouter.get({
	path: '/communities/:id/stats',
	name: 'communities.getStats',
	guard: guards.guest,
	allowNotFound: true,
	schema: {
		params: z.object({
			id: z.string()
		}),
		response: communityStatsSchema
	},
	async handler({ params, auth }) {
		const typesToFilter: RootFilterQuery<ICommunity> = auth?.moderator
			? {}
			: {
					type: {
						$ne: COMMUNITY_TYPE.Private
					}
				};

		const community = await Community.findOne(deleteOptional({
			olive_community_id: params.id,
			...typesToFilter
		}));
		if (!community) {
			throw errors.for('not_found');
		}

		const totalPosts = await Post.find({
			community_id: community.olive_community_id,
			parent: null,
			removed: false
		}).countDocuments();

		return mapCommunityStats(community, totalPosts);
	}
});

communitiesRouter.get({
	path: '/communities/:id',
	name: 'communities.get',
	guard: guards.guest,
	allowNotFound: true,
	schema: {
		params: z.object({
			id: z.string().openapi({ description: 'A community ID or a title ID starting with `tid:`' })
		}),
		response: communitySchema
	},
	async handler({ params, auth }) {
		let titleId: undefined | string = undefined;
		let communityId: undefined | string = params.id;
		if (params.id.startsWith('tid:')) {
			communityId = undefined;
			titleId = params.id.slice(4);
		}

		const typesToFilter: RootFilterQuery<ICommunity> = auth?.moderator
			? {}
			: {
					type: {
						$ne: COMMUNITY_TYPE.Private
					}
				};

		const community = await Community.findOne(deleteOptional({
			olive_community_id: communityId,
			title_id: titleId,
			...typesToFilter
		}));
		if (!community) {
			throw errors.for('not_found');
		}

		return mapCommunity(community);
	}
});

async function calculateMostPopularCommunities(rangeMs: number): Promise<string[]> {
	const now = new Date();
	const last24Hours = new Date(now.getTime() - rangeMs);

	const posts = await Post.find({ created_at: { $gte: last24Hours }, message_to_pid: null }).lean();

	const communityIds: Record<string, number> = {};
	for (const post of posts) {
		const communityId = post.community_id;
		if (!communityId) {
			continue;
		}

		communityIds[communityId] ??= 0;
		communityIds[communityId] += 1;
	}
	return Object.entries(communityIds)
		.sort((a, b) => b[1] - a[1])
		.map(entry => entry[0]);
}
