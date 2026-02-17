import * as z from 'zod';
import type { SortOrder } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Zod schema is inferred here
export function pageSchema(limit = 50) {
	return z.object({
		limit: z.coerce.number().min(1).max(limit).default(10),
		offset: z.coerce.number().min(0).default(0)
	});
}

// Sorting method - if 'newest' is provided, the newest will be returned first. Same for other options
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Zod schema is inferred here
export function sortSchema(def?: 'newest' | 'oldest') {
	return z.enum(['newest', 'oldest']).default(def ?? 'newest');
}

export function sortOptionToQuery(sort: SortOptions): SortOrder {
	return sort === 'newest' ? -1 : 1;
}

export type PageControls = z.infer<ReturnType<typeof pageSchema>>;
export type SortOptions = z.infer<ReturnType<typeof sortSchema>>;
