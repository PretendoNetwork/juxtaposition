import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { Notification, NotificationRecipient } from '@/prisma/client';
import type { FollowNotificationContent, LimitedFromPostingNotificationContent, PostDeletedNotificationContent, SystemNotificationContent } from '@/services/internal/utils/notifications';

export const followNotificationSchema = asOpenapi('FollowNotification', z.object({
	type: z.literal('follow'),
	content: z.object({
		users: z.array(z.object({
			pid: z.number(),
			timestamp: z.date()
		}))
	})
}));

export const systemNotificationSchema = asOpenapi('SystemNotification', z.object({
	type: z.literal('system'),
	content: z.object({
		imagePath: z.string(),
		link: z.string(),
		text: z.string()
	})
}));

export const postDeletedNotificationSchema = asOpenapi('PostDeletedNotification', z.object({
	type: z.literal('postDeleted'),
	content: z.object({
		postId: z.string(),
		reason: z.string().optional(),
		postType: z.enum(['comment', 'post'])
	})
}));

export const limitedFromPostingNotificationSchema = asOpenapi('LimitedFromPostingNotification', z.object({
	type: z.literal('limitedFromPosting'),
	content: z.object({
		reason: z.string().optional(),
		until: z.date().optional()
	})
}));

export const notificationSchema = z.object({
	pid: z.number(),
	hasRead: z.boolean(),
	updatedAt: z.date(),
	notif: z.discriminatedUnion('type', [
		followNotificationSchema,
		systemNotificationSchema,
		postDeletedNotificationSchema,
		limitedFromPostingNotificationSchema
	])
}).openapi('Notification');

export type NotificationDto = z.infer<typeof notificationSchema>;

export function mapNotification(recipient: NotificationRecipient, notif: Notification): NotificationDto {
	let data: NotificationDto['notif'] | null = null;

	if (notif.type === 'Follow') {
		const content = notif.content as FollowNotificationContent;
		data = {
			type: 'follow',
			content: {
				users: content.users.map(v => ({
					pid: v.pid,
					timestamp: new Date(v.timestamp)
				}))
			}
		};
	}

	if (notif.type === 'System') {
		const content = notif.content as SystemNotificationContent;
		data = {
			type: 'system',
			content
		};
	}

	if (notif.type === 'LimitedFromPosting') {
		const content = notif.content as LimitedFromPostingNotificationContent;
		data = {
			type: 'limitedFromPosting',
			content: {
				reason: content.reason,
				until: content.until ? new Date(content.until) : undefined
			}
		};
	}

	if (notif.type === 'PostDeleted') {
		const content = notif.content as PostDeletedNotificationContent;
		data = {
			type: 'postDeleted',
			content
		};
	}

	if (!data) {
		throw new Error(`No DTO mapping for notification ${notif.type} found`);
	}

	return {
		pid: recipient.pid,
		hasRead: recipient.hasRead,
		updatedAt: notif.updatedAt,
		notif: data
	};
}
