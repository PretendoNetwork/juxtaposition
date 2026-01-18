import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { Request } from 'express';
import type { z } from 'zod';
import type { UserTokens } from '@/types/juxt/tokens';
import type { ParamPack } from '@/types/common/param-pack';

type AnySchema = z.ZodObject | z.ZodPipe | undefined | null;

export type AuthRequest<TReq extends Request = Request> = TReq & {
	user: AccountGetUserDataResponse;
	pid: number;
	tokens: UserTokens;
	paramPackData: null | ParamPack;
};

export type AuthContext = {
	user: AccountGetUserDataResponse;
	pid: number;
	tokens: UserTokens;
	paramPackData: null | ParamPack;
};

export type ParseRequestOptions<TBody extends AnySchema, TQuery extends AnySchema, TParams extends AnySchema, TFiles extends string[]> = {
	body?: TBody;
	query?: TQuery;
	params?: TParams;
	files?: TFiles;
};

export type ParsedRequest<TBody extends AnySchema, TQuery extends AnySchema, TParams extends AnySchema, TFiles extends string[]> = {
	body: TBody extends z.ZodType ? z.infer<TBody> : undefined;
	query: TQuery extends z.ZodType ? z.infer<TQuery> : undefined;
	params: TParams extends z.ZodType ? z.infer<TParams> : undefined;
	files: Record<TFiles[number], Express.Multer.File[]>;
	auth: () => AuthContext;
	hasAuth: () => boolean;
};

export function getAuthedRequest<TReq extends Request = Request>(req: TReq): AuthRequest<TReq> {
	if (!(req as any).user) {
		throw new Error('Trying to get authed request while not being authed');
	}
	return req as AuthRequest<TReq>;
}

export function parseReq<TBody extends AnySchema = undefined, TQuery extends AnySchema = undefined, TParams extends AnySchema = undefined, TFiles extends string[] = []>(req: Request, ops?: ParseRequestOptions<TBody, TQuery, TParams, TFiles>): ParsedRequest<TBody, TQuery, TParams, TFiles> {
	let body: any = undefined;
	let query: any = undefined;
	let params: any = undefined;
	const files = {} as Record<TFiles[number], Express.Multer.File[]>;

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

	if (ops?.params) {
		const res = ops.params.safeParse(req.params);
		if (!res.success) {
			throw res.error;
		}
		params = res.data;
	}

	if (ops?.files) {
		const reqFiles = req.files && !Array.isArray(req.files) ? req.files : {};
		ops.files.forEach((v) => {
			files[v as TFiles[number]] = reqFiles[v] ? (reqFiles[v] ?? []) : [];
		});
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

	function hasAuth(): boolean {
		if (!(req as any).user) {
			return false;
		}
		return true;
	}

	return {
		body,
		query,
		params,
		files,
		auth: getAuthContext,
		hasAuth
	} as ParsedRequest<TBody, TQuery, TParams, TFiles>;
}
