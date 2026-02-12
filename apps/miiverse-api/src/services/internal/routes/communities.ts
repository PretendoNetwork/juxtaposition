import express from 'express';
import { z } from 'zod';
import { FuzzySearch } from 'mongoose-fuzzy-search-next';
import { handle } from '@/services/internal/utils';
import { guards } from '@/services/internal/middleware/guards';
import { mapPages } from '@/services/internal/contract/page';
import { pageSchema, sortOptionToQuery, sortSchema } from '@/services/internal/pagination';
import { Community, communityTypes } from '@/models/community';
import { mapCommunity } from '@/services/internal/contract/community';

export const communityRouter = express.Router();

// List communities
communityRouter.get('/communities', guards.user, handle(async ({ req }) => {
	const query = z.object({
		parent_id: z.string().optional(),
		sort: sortSchema()
	}).and(pageSchema(100)).parse(req.query);

	let communityQuery = Community.find({
		parent: null,
		type: [communityTypes.main, communityTypes.announcement]
	});
	if (query.parent_id) {
		communityQuery = Community.find({
			parent: query.parent_id,
			type: [communityTypes.sub]
		});
	}

	const communities = await communityQuery
		.sort({ created_at: sortOptionToQuery(query.sort) })
		.skip(query.offset)
		.limit(query.limit);

	// PageDto<CommunityDto>
	return mapPages(communities.map(mapCommunity));
}));

// Search communities - restricted to moderators since it also adds private communities
communityRouter.post('/communities/search', guards.moderator, handle(async ({ req }) => {
	const query = pageSchema().parse(req.query);
	const body = z.object({
		keyword: z.string().min(1)
	}).parse(req.body);

	const communities = await Community
		.find(FuzzySearch(['name'], body.keyword))
		.sort({ created_at: 'asc' })
		.skip(query.offset)
		.limit(query.limit);

	// PageDto<CommunityDto>
	return mapPages(communities.map(mapCommunity));
}));
