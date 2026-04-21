import { z } from 'zod';

export function listDtoSchema<T extends z.ZodType>(item: T) {
	return z.object({
		items: z.array(item)
	});
}

export type ListDto<T> = z.infer<ReturnType<typeof listDtoSchema<z.ZodType<T>>>>;

export function mapList<T>(items: T[]): ListDto<T> {
	return {
		items
	};
}
