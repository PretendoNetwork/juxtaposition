import { z } from 'zod';

export function pageControlSchema(limit = 50) {
	return {
		limit: z.coerce.number().min(1).max(limit).default(10),
		offset: z.coerce.number().min(0).default(0)
	};
}

export function pageDtoSchema<T extends z.ZodType>(item: T) {
	return z.object({
		items: z.array(item)
	}).openapi('Page');
}

export type PageDto<T> = z.infer<ReturnType<typeof pageDtoSchema<z.ZodType<T>>>>;

export function mapPage<T>(items: T[]): PageDto<T> {
	return {
		items
	};
}
