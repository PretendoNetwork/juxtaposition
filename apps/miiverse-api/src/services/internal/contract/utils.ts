import { z } from 'zod';

export const standardSortSchema = z.enum(['newest', 'oldest']).default('newest').openapi('StandardSortEnum');
export type StandardSortEnum = z.infer<typeof standardSortSchema>;

export function standardSortToDirection(sort: StandardSortEnum): 1 | -1 {
	return sort === 'newest' ? -1 : 1;
}
