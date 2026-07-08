import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { HydratedContentDocument } from '@/types/mongoose/content';
import type { UserWithSettingsAndFollows } from '@/services/internal/utils/user';

export interface AccountData {
	pnid: GetUserDataResponse;
	user: UserWithSettingsAndFollows | null;
	content: HydratedContentDocument | null;
	moderator: boolean;
	developer: boolean;
}
