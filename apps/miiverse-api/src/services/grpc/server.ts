import { ServerError, Status } from 'nice-grpc';
import { deleteAccountData } from '@/services/grpc/deleteAccountData';
import type { MiiverseServiceImplementation } from '@pretendonetwork/grpc/miiverse/v2/miiverse_service';

export const miiverseDefinition: MiiverseServiceImplementation = {
	deleteAccountData,
	sMMRequestPostId: async (_request) => {
		throw new ServerError(Status.UNIMPLEMENTED, 'Not implemented');
	}
};
