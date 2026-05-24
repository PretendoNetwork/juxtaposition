import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowCommunity, shallowCommunitySchema } from '@/services/internal/contract/community';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { IPost } from '@/types/mongoose/post';
import type { HydratedCommunityDocument } from '@/types/mongoose/community';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const postSchema = asOpenapi('Post', z.object({
	id: z.string(),
	createdAt: z.date(),
	parentId: z.string().nullable(),
	dmTo: z.number().nullable(),
	community: shallowCommunitySchema.nullable(),
	author: z.object({
		miiName: z.string(),
		pid: z.number(),
		verified: z.boolean()
	}),
	mii: z.object({
		data: z.string(),
		imageUrl: z.string()
	}),

	feelingId: z.number().nullable(),
	body: z.string().nullable(),
	painting: z.object({
		data: z.string(),
		imageUrl: z.string(),
		imageUrlBig: z.string()
	}).nullable(),
	screenshot: z.object({
		imageUrl: z.string(),
		imageUrlBig: z.string(),
		imageUrlThumbnail: z.string(),
		length: z.number(),
		aspectRatio: z.enum(['4:3', '5:3', '16:9'])
	}).nullable(),

	stats: z.object({
		empathyCount: z.number(),
		replyCount: z.number()
	}),
	yeahsBy: z.array(z.object({
		pid: z.number()
	})),

	searchKey: z.array(z.string()),
	topicTag: z.string().nullable(),

	isAutopost: z.boolean(),
	isCommunityPrivateAutopost: z.boolean(),
	isSpoiler: z.boolean(),
	isAppJumpable: z.boolean(),

	countryId: z.number(),
	languageId: z.number(),
	platformId: z.number().nullable(),
	regionId: z.number().nullable(),
	titleId: z.string().nullable(),
	appData: z.string().nullable(),

	moderation: z.object({
		removed: z.object({
			removedBy: shallowUserSchema.nullable(),
			removedAt: z.date(),
			reason: z.string()
		}).nullable()
	}).nullable()
}));

export type PostDto = z.infer<typeof postSchema>;

export function mapPost(post: IPost, comm: HydratedCommunityDocument | null): PostDto {
	return {
		id: post.id,
		createdAt: post.created_at,
		parentId: post.parent ?? null,
		dmTo: post.message_to_pid ? Number(post.message_to_pid) : null,
		community: comm ? mapShallowCommunity(comm) : null,
		author: {
			miiName: post.screen_name,
			pid: post.pid,
			verified: post.verified
		},
		mii: {
			data: post.mii,
			imageUrl: post.mii_face_url
		},

		feelingId: post.feeling_id ?? null,
		body: post.body ? post.body : null,
		painting: post.painting
			? {
					data: post.painting,
					imageUrl: post.painting_img ?? '',
					imageUrlBig: post.painting_big ?? ''
				}
			: null,
		screenshot: post.screenshot
			? {
					imageUrl: post.screenshot,
					imageUrlBig: post.screenshot_big ?? '',
					imageUrlThumbnail: post.screenshot_thumb ?? '',
					length: post.screenshot_length ?? 0,
					aspectRatio: post.screenshot_aspect as any
				}
			: null,

		stats: {
			empathyCount: post.empathy_count,
			replyCount: post.reply_count
		},
		yeahsBy: post.yeahs.map(pid => ({
			pid
		})),

		searchKey: post.search_key ?? [],
		topicTag: post.topic_tag ?? null,

		isAutopost: !!post.is_autopost,
		isCommunityPrivateAutopost: !!post.is_community_private_autopost,
		isSpoiler: !!post.is_spoiler,
		isAppJumpable: !!post.is_app_jumpable,

		countryId: post.country_id,
		languageId: post.language_id,
		platformId: post.platform_id ?? null,
		regionId: post.region_id ?? null,
		titleId: post.title_id ?? null,
		appData: post.app_data ?? null,

		moderation: null
	};
}

export function mapPostWithModeration(post: IPost, comm: HydratedCommunityDocument | null, remover: HydratedSettingsDocument | null): PostDto {
	return {
		...mapPost(post, comm),

		moderation: {
			removed: post.removed
				? {
						removedBy: remover ? mapShallowUser(remover) : null,
						removedAt: post.removed_at ?? new Date(),
						reason: post.removed_reason ?? ''
					}
				: null
		}
	};
}
