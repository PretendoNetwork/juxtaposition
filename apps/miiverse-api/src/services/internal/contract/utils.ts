import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { FilterQuery } from 'mongoose';
import type { HydratedPostDocument } from '@/types/mongoose/post';

export const standardSortSchema = z.enum(['newest', 'oldest']).default('newest').openapi('StandardSortEnum');
export type StandardSortEnum = z.infer<typeof standardSortSchema>;

export function standardSortToDirection(sort: StandardSortEnum): 1 | -1 {
	return sort === 'newest' ? -1 : 1;
}

export const postTypeFilter = asOpenapi('PostTypeFilter', z.enum(['post', 'reply', 'all']));
export type PostTypeFilterEnum = z.infer<typeof postTypeFilter>;

export function getPostTypeFilter(filter: PostTypeFilterEnum): FilterQuery<HydratedPostDocument> {
	if (filter === 'post') {
		return { parent: null };
	}
	if (filter === 'reply') {
		return { parent: { $ne: null } };
	}
	return {};
}
