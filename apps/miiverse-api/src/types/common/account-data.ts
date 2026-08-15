import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/v2/get_user_data_rpc';
import type { UserWithSettingsAndFollows } from '@/services/internal/utils/user';

export interface AccountData {
	pnid: GetUserDataResponse;
	user: UserWithSettingsAndFollows | null;
	moderator: boolean;
	developer: boolean;
}
