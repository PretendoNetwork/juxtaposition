import { ServerError, Status } from 'nice-grpc';
import { Community } from '@/models/community';
import type { GetCommunityByIDRequest, GetCommunityByIDResponse } from '@pretendonetwork/grpc/miiverse/v2/get_community_by_id_rpc';

export async function getCommunityByID(req: GetCommunityByIDRequest): Promise<GetCommunityByIDResponse> {
	const community = await Community.findOne({
		community_id: req.communityId
	});

	if (!community) {
		throw new ServerError(Status.NOT_FOUND, `Community with ID ${req.communityId} was not found`);
	}

	return {
		community: await community.proto()
	};
}
