import * as z from 'zod';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- Zod schema is inferred here
export function pageSchema(limit = 50) {
	return z.object({
		limit: z.coerce.number().min(1).max(limit).default(10),
		offset: z.coerce.number().min(0).default(0)
	});
}

export type PageControls = z.infer<ReturnType<typeof pageSchema>>;
