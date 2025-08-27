import type { ParamPack } from '@/types/common/param-pack';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { Request } from 'express';
import type { AnyZodObject, z, ZodSchema } from 'zod';

type AnySchema = AnyZodObject | undefined | null;

export type AuthRequest<TReq extends Request = Request> = TReq & {
	user: AccountGetUserDataResponse;
	pid: number;
	tokens: {
		serviceToken?: string;
		oauthToken?: string;
	};
	paramPackData: null | ParamPack;
};

export type AuthContext = {
	user: AccountGetUserDataResponse;
	pid: number;
	tokens: {
		serviceToken?: string;
		oauthToken?: string;
	};
	paramPackData: null | ParamPack;
};

export type ParseRequestOptions<TBody extends AnySchema, TQuery extends AnySchema> = {
	body?: TBody;
	query?: TQuery;
};

export type ParsedRequest<TBody extends AnySchema, TQuery extends AnySchema> = {
	body: TBody extends ZodSchema ? z.infer<TBody> : undefined;
	query: TQuery extends ZodSchema ? z.infer<TQuery> : undefined;
	auth: () => AuthContext;
};

export function getAuthedRequest<TReq extends Request = Request>(req: TReq): AuthRequest<TReq> {
	if (!(req as any).user) {
		throw new Error('Trying to get authed request while not being authed');
	}
	return req as AuthRequest<TReq>;
}

export function parseReq<TBody extends AnySchema = undefined, TQuery extends AnySchema = undefined>(req: Request, ops?: ParseRequestOptions<TBody, TQuery>): ParsedRequest<TBody, TQuery> {
	let body: any = undefined;
	let query: any = undefined;

	if (ops?.body) {
		const res = ops.body.safeParse(req.body);
		if (!res.success) {
			throw res.error;
		}
		body = res.data;
	}

	if (ops?.query) {
		const res = ops.query.safeParse(req.query);
		if (!res.success) {
			throw res.error;
		}
		query = res.data;
	}

	function getAuthContext(): AuthContext {
		const authedReq = getAuthedRequest(req);
		const result: AuthContext = {
			pid: authedReq.pid,
			user: authedReq.user,
			tokens: authedReq.tokens,
			paramPackData: authedReq.paramPackData
		};
		return result;
	}

	return {
		body,
		query,
		auth: getAuthContext
	} as ParsedRequest<TBody, TQuery>;
}
