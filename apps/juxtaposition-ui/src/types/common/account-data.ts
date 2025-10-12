import type { UserSettingsDto } from '@/api/settings';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';

export interface AccountData {
	pnid: GetUserDataResponse;
	settings: UserSettingsDto | null;
	moderator: boolean;
}
