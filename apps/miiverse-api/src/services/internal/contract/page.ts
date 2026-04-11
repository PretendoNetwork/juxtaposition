import { z } from 'zod';

export function pageDtoSchema<T extends z.ZodType>(item: T) {
	return z.object({
		items: z.array(item)
	});
}

export type PageDto<T> = z.infer<ReturnType<typeof pageDtoSchema<z.ZodType<T>>>>;

export function mapPage<T>(items: T[]): PageDto<T> {
	return {
		items
	};
}
