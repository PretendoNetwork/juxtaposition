import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';
import type { HydratedContentDocument } from '@/types/mongoose/content';

export interface AccountData {
	pnid: GetUserDataResponse;
	settings: HydratedSettingsDocument | null;
	content: HydratedContentDocument | null;
	moderator: boolean;
	developer: boolean;
}
