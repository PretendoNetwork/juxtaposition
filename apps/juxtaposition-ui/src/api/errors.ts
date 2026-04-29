import type { ErrorCodes } from '@/api/generated';
import type { RequestResult } from '@/api/generated/client';

export class InternalApiError extends Error {
	status: number;
	response: any;
	code: ErrorCodes | undefined;

	constructor(res: Response, body: any) {
		super(`Interal API fetch call failed with status ${res.status}`);
		this.status = res.status;
		this.response = body;

		if ('code' in body) {
			this.code = body.code as ErrorCodes;
		}
	}

	isCode(code: ErrorCodes): boolean {
		return this.code === code;
	}
}

export async function wrapApi<T>(prom: Promise<RequestResult<T, any, true, 'fields'>>): Promise<{ error: null | InternalApiError; result: T | null }> {
	try {
		const result = await prom;
		return { result: result.data as T, error: null };
	} catch (err) {
		if (err instanceof InternalApiError) {
			return { result: null, error: err };
		}
		throw err;
	}
}
