import type { Request } from 'express';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { ParamPack } from '@/types/common/param-pack';

export type AuthRequest<TReq extends Request = Request> = TReq & {
	user: AccountGetUserDataResponse;
	pid: number;
	tokens: {
		serviceToken?: string;
		oauthToken?: string;
	};
	paramPackData: null | ParamPack;
};

// TODO this needs a rework: preferably we have this on the request object and is asserted before reaching the route handlers
export function getAuthedRequest<TReq extends Request = Request>(req: TReq): AuthRequest<TReq> {
	if (!(req as any).user) {
		throw new Error('Trying to get authed request while not being authed');
	}
	return req as AuthRequest<TReq>;
}
