import * as z from 'zod/v4';

export const postIdSchema = z.string().length(21);
export const postIdObjSchema = z.object({
	post_id: postIdSchema
});

// maybe this should be z.coerce.number()
export const pidSchema = z.number();
export const pidOrSelfSchema = z.union([z.literal('@me'), pidSchema]);
