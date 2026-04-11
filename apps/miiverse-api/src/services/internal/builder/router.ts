import { Router } from 'express';
import { buildAuthContext } from '@/services/internal/builder/auth';
import { createRouteContext } from '@/services/internal/builder/context';
import type { Request, RequestHandler, Response } from 'express';
import type { z } from 'zod';
import type { AuthContext } from '@/services/internal/builder/auth';
import type { ZodRouteContext, ZodRouteSchemaSchape } from '@/services/internal/builder/context';

export type ZodRouteHandler<TContext extends ZodRouteContext, TResponse = any> = (ops: TContext) => TResponse;

export type ZodRouteOptions<TSchema extends ZodRouteSchemaSchape = {}, TAuthCtx = unknown> = {
	path: string;
	guard: RequestHandler;
	schema: TSchema;
	handler: (ops: ZodRouteContext<TSchema, TAuthCtx>) => Promise<z.infer<TSchema['response']>>;
};

export type RouteMethods = 'get' | 'post' | 'delete' | 'patch';

export type ZodRouter<TAuthCtx = unknown> = {
	post<const TSchema extends ZodRouteSchemaSchape>(ops: ZodRouteOptions<TSchema, TAuthCtx>): void;
	get<const TSchema extends ZodRouteSchemaSchape>(ops: ZodRouteOptions<TSchema, TAuthCtx>): void;
	patch<const TSchema extends ZodRouteSchemaSchape>(ops: ZodRouteOptions<TSchema, TAuthCtx>): void;
	delete<const TSchema extends ZodRouteSchemaSchape>(ops: ZodRouteOptions<TSchema, TAuthCtx>): void;
	toRouter(): Router;
};

export type CreateZodRouterOptions<TAuthCtx> = {
	createAuthCtx(req: Request, res: Response): TAuthCtx;
};

export function createZodRouter<TAuthCtx>(ops: CreateZodRouterOptions<TAuthCtx>): ZodRouter<TAuthCtx> {
	const baseRouter = Router();
	const routerBuilder = (method: RouteMethods, route: ZodRouteOptions<ZodRouteSchemaSchape, TAuthCtx>): void => {
		baseRouter[method](route.path, route.guard, async (req, res) => {
			const authCtx = ops.createAuthCtx(req, res);
			const ctx = createRouteContext(req, res, route.schema, authCtx);
			const result = await route.handler(ctx);
			res.json(result);
		});
	};

	return {
		get: route => routerBuilder('get', route),
		post: route => routerBuilder('post', route),
		delete: route => routerBuilder('delete', route),
		patch: route => routerBuilder('patch', route),
		toRouter: () => baseRouter
	};
}

export function createInternalApiRouter(): ZodRouter<AuthContext> {
	return createZodRouter({
		createAuthCtx: buildAuthContext
	});
}
