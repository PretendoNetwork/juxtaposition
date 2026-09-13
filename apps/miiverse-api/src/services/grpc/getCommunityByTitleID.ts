import { ServerError, Status } from 'nice-grpc';
import { Community } from '@/models/community';
import type { GetCommunityByTitleIDRequest, GetCommunityByTitleIDResponse } from '@pretendonetwork/grpc/miiverse/v2/get_community_by_title_id_rpc';

export async function getCommunityByTitleID(req: GetCommunityByTitleIDRequest): Promise<GetCommunityByTitleIDResponse> {
	const community = await Community.findOne({
		title_id: req.titleId
	});

	if (!community) {
		throw new ServerError(Status.NOT_FOUND, `Community with Title ID ${req.titleId} was not found`);
	}

	return {
		community: await community.proto()
	};
}
