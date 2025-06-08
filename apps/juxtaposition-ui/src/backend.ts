import { apiFetchUser } from '@/fetch';
import { PostSchema } from '@/models/api/post';
import type { UserTokens } from '@/fetch';
import type { Post } from '@/models/api/post';

export async function getPostById(tokens: UserTokens, post_id: string): Promise<Post> {
	const data = await apiFetchUser(tokens, `/api/v1/posts/${post_id}`);
	const post = await PostSchema.parseAsync(data); // todo: what to do on validation fail..?
	return post;
}
