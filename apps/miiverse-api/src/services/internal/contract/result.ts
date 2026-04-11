import { z } from 'zod';

export const resultStrSchema = z.enum(['success', 'scheduled']);
export type ResultStr = z.infer<typeof resultStrSchema>;

export const resultSchema = z.object({
	status: resultStrSchema
}).openapi('Result');
export type ResultDto = z.infer<typeof resultSchema>;

export function mapResult(status: ResultStr): ResultDto {
	return {
		status
	};
}
