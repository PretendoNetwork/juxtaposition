import { ServerError, Status } from 'nice-grpc';
import type { MiiverseServiceImplementation } from '@pretendonetwork/grpc/miiverse/v2/miiverse_service';

export const miiverseDefinition: MiiverseServiceImplementation = {
	deleteAccountData: async (_request) => {
		throw new ServerError(Status.UNIMPLEMENTED, 'Not implemented');
	},
	sMMRequestPostId: async (_request) => {
		throw new ServerError(Status.UNIMPLEMENTED, 'Not implemented');
	}
};
