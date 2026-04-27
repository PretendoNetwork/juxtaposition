import { z } from 'zod';

export function pageControlSchema(limit = 50) {
	return {
		limit: z.coerce.number().min(1).max(limit).default(10),
		offset: z.coerce.number().min(0).default(0)
	};
}

export function pageDtoSchema<T extends z.ZodType>(item: T) {
	return z.object({
		items: z.array(item),
		total: z.number()
	});
}

export function feedPageDtoSchema<T extends z.ZodType>(item: T) {
	return z.object({
		// TODO add cursor paged pagination here
		items: z.array(item)
	});
}

export type PageDto<T> = z.infer<ReturnType<typeof pageDtoSchema<z.ZodType<T>>>>;
export type FeedPageDto<T> = z.infer<ReturnType<typeof feedPageDtoSchema<z.ZodType<T>>>>;

export function mapPage<T>(total: number, items: T[]): PageDto<T> {
	return {
		items,
		total
	};
}

export function mapFeedPage<T>(items: T[]): FeedPageDto<T> {
	return {
		items
	};
}
