import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { Notification, NotificationRecipient } from '@/prisma/client';
import type { FollowNotificationContent, SystemNotificationContent } from '@/services/internal/utils/notifications';

export const notificationTypeSchema = asOpenapi('NotificationType', z.enum(['system', 'follow']));
export type NotificationType = z.infer<typeof notificationTypeSchema>;

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

export const notificationSchema = z.object({
	pid: z.number(),
	hasRead: z.boolean(),
	updatedAt: z.date(),
	notif: z.discriminatedUnion('type', [
		followNotificationSchema,
		systemNotificationSchema
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
