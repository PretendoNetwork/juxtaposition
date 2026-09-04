import { ServerError, Status } from 'nice-grpc';
import { Post } from '@/models/post';
import type { GetPostRequest, GetPostResponse } from '@pretendonetwork/grpc/miiverse/v2/get_post_rpc';

export async function getPost(req: GetPostRequest): Promise<GetPostResponse> {
	const post = await Post.findOne({
		id: req.postId
	});

	if (!post) {
		throw new ServerError(Status.NOT_FOUND, `Post with ID ${req.postId} was not found`);
	}

	return {
		post: post.proto({
			app_data: true,
			with_mii: true
		})
	};
}
