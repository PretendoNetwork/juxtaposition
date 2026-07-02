import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { Notification, NotificationRecipient } from '@/prisma/client';

export const notificationTypeSchema = asOpenapi('NotificationType', z.enum(['system', 'follow']));
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
	pid: z.number(),
	hasRead: z.boolean(),
	updatedAt: z.date(),
	type: notificationTypeSchema
	// TODO implement new DTO for notification content
}).openapi('Notification');

export type NotificationDto = z.infer<typeof notificationSchema>;

export function mapNotification(recipient: NotificationRecipient, notif: Notification): NotificationDto {
	return {
		pid: recipient.pid,
		hasRead: recipient.hasRead,
		updatedAt: notif.updatedAt,
		type: notif.type === 'Follow' ? 'follow' : 'system'
	};
}
