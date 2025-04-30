import type { ParamPack } from '@/types/common/param-pack';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

declare global {
	namespace Express {
		interface Request {
			pid: number;
			paramPack: ParamPack;
			// topics and status requests may not have a valid token
			user?: GetUserDataResponse;
		}
	}
}
