import { z } from 'zod';
import { uploadPainting, uploadScreenshot } from '@/images';
import { getShotModeForTitleId } from '@/services/api/routes/posts';
import { getInvalidPostRegex } from '@/util';
import { config } from '@/config';
import { getDuplicatePosts } from '@/database';
import { Post } from '@/models/post';
import type { PaintingUrls } from '@/images';
import type { HydratedPostDocument, IPostInput } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';

export const postCreateSchema = z.object({
	body: z.string().optional(),
	feelingId: z.number(),
	isSpoiler: z.boolean().default(false),
	isAppJumpable: z.boolean().default(false),
	painting: z.object({
		file: z.base64(),
		isBmp: z.boolean()
	}).optional(),
	screenshot: z.object({
		file: z.base64(),
		titleId: z.string()
	}).optional(),
	languageId: z.number().optional(),
	countryId: z.number().optional(),
	platformId: z.number().optional(),
	regionId: z.number().optional()
});

export type PostCreateBody = z.infer<typeof postCreateSchema>;

export type PostCreateOptions = {
	body: PostCreateBody;
	author: {
		pid: number;
		screenName: string;
		miiData: string;
		verified: boolean;
	};
	parentPost: HydratedPostDocument | null;
	community: HydratedCommunityDocument;
};

const defaultMiiFaceFilename = 'normal_face.png';
const miiFaceFilenameMap: Record<number, string> = {
	0: 'normal_face.png',
	1: 'smile_open_mouth.png',
	2: 'wink_left.png',
	3: 'surprise_open_mouth.png',
	4: 'frustrated.png',
	5: 'sorrow.png'
};

/**
 * Create a new post from an input body
 * Warning: Does not check if it should be posted, validation should be done outside of this method
 */
export async function createNewPost(ops: PostCreateOptions): Promise<HydratedPostDocument> {
	const body = ops.body;
	const postId = await generatePostUID(21);

	let paintings: PaintingUrls | null = null;
	if (body.painting) {
		paintings = await uploadPainting({
			blob: body.painting.file,
			autodetectFormat: false,
			isBmp: body.painting.isBmp,
			pid: ops.author.pid,
			postId
		});
		if (paintings === null) {
			throw new Error('Failed to upload paintings');
		}
	}

	let screenshots = null;
	if (body.screenshot) {
		const shotMode = getShotModeForTitleId(ops.community, body.screenshot.titleId);
		if (shotMode !== 'block') {
			screenshots = await uploadScreenshot({
				blob: body.screenshot.file,
				pid: ops.author.pid,
				postId
			});
			if (screenshots === null) {
				throw new Error('Failed to upload screenshots');
			}
		}
	}

	const miiFace = miiFaceFilenameMap[body.feelingId] ?? defaultMiiFaceFilename;

	const postBody = body.body?.replaceAll('\r\n', '\n'); // Clean up \r\n
	if (postBody && getInvalidPostRegex().test(postBody)) {
		throw new Error('Invalid characters found in post body');
	}

	if (postBody && postBody.length > 280) {
		throw new Error('Post body is top long');
	}

	const document: IPostInput = {
		title_id: ops.community.title_id[0],
		community_id: ops.community.olive_community_id,
		screen_name: ops.author.screenName,
		body: postBody,
		painting: paintings?.blob ?? '',
		painting_img: paintings?.img ?? '',
		painting_big: paintings?.big ?? '',
		screenshot: screenshots?.full ?? '',
		screenshot_big: screenshots?.big ?? '',
		screenshot_length: screenshots?.fullLength ?? 0,
		screenshot_thumb: screenshots?.thumb ?? '',
		screenshot_aspect: screenshots?.aspect ?? '',
		country_id: body.countryId ?? 49,
		created_at: new Date(),
		feeling_id: body.feelingId,
		id: postId,
		is_autopost: 0,
		is_spoiler: body.isSpoiler ? 1 : 0,
		is_app_jumpable: body.isAppJumpable ? 1 : 0,
		language_id: body.languageId,
		mii: ops.author.miiData,
		mii_face_url: `${config.cdnUrl}/mii/${ops.author.pid}/${miiFace}`,
		pid: ops.author.pid,
		platform_id: body.platformId ?? 0,
		region_id: body.regionId ?? 2,
		verified: ops.author.verified,
		parent: ops.parentPost?.id
	};

	const maxDuplicatePostAgeMs = 5 * 60 * 1000;
	const duplicatePost = await getDuplicatePosts(ops.author.pid, document, maxDuplicatePostAgeMs);
	if (duplicatePost) {
		throw new Error('Duplicate post found');
	}

	if (document.body === '' && document.painting === '' && document.screenshot === '') {
		throw new Error('No valid post content');
	}

	const newPost = await Post.create(document);

	if (ops.parentPost) {
		await Post.findOneAndUpdate({
			id: ops.parentPost.id
		}, {
			$inc: {
				reply_count: 1
			}
		});
	}

	return newPost;
}

async function generatePostUID(length: number): Promise<string> {
	let id = Buffer.from(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length * 2))), 'binary').toString('base64').replace(/[+/]/g, '').substring(0, length);
	const inuse = await Post.findOne({ id });
	id = (inuse ? await generatePostUID(length) : id);
	return id;
}
