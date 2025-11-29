import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export interface AccountData {
	pnid: GetUserDataResponse;
	settings: HydratedSettingsDocument | null;
	moderator: boolean;
}
