import type { Request, Response } from 'express';
import type { z } from 'zod';

export type ZodRouteSchemaSchape = {
	body?: z.ZodType;
	query?: z.ZodType;
	params?: z.ZodType;
	response?: z.ZodType;
};

export type ZodRouteContext<TSchema extends ZodRouteSchemaSchape = {}, TAuthCtx = unknown> = {
	body: z.infer<TSchema['body']>;
	query: z.infer<TSchema['query']>;
	params: z.infer<TSchema['params']>;
	auth: TAuthCtx;
};

export function createRouteContext<TSchema extends ZodRouteSchemaSchape = {}, TAuthCtx = unknown>(req: Request, res: Response, schema: TSchema, authCtx: TAuthCtx): ZodRouteContext<TSchema, TAuthCtx> {
	const body = schema.body ? schema.body.parse(req.body) : undefined;
	const query = schema.query ? schema.query.parse(req.query) : undefined;
	const params = schema.params ? schema.params.parse(req.params) : undefined;

	return {
		body,
		query,
		params,
		auth: authCtx
	} as ZodRouteContext<TSchema, TAuthCtx>;
}
