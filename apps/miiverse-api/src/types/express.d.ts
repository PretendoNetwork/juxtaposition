import type { ParamPack } from '@/types/common/param-pack';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { ApiErrorCode } from '@/errors';

declare global {
	namespace Express {
		interface Request {
			pid: number;
			paramPack: ParamPack;
			// topics and status requests may not have a valid token
			user?: GetUserDataResponse;
		}
		interface Response {
			errorCode?: ApiErrorCode;
		}
	}
}
