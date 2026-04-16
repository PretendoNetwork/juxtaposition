import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import type { INotification } from '@/types/mongoose/notification';

export const notificationTypeSchema = asOpenapi('NotificationType', z.enum(['follow', 'notice']));
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
	toPid: z.number(),
	link: z.string().nullable(),
	imageUrl: z.string(),
	content: z.string(),
	read: z.boolean(),
	updatedAt: z.date(),
	type: notificationTypeSchema,
	users: z.array(z.object({
		pid: z.number(),
		timestamp: z.date()
	})).default([])
}).openapi('Notification');

export type NotificationDto = z.infer<typeof notificationSchema>;

export function mapNotification(notif: INotification): NotificationDto {
	return {
		toPid: Number(notif.pid),
		read: notif.read,
		updatedAt: notif.lastUpdated,
		link: notif.link,
		type: notif.type as any,
		users: notif.users.map(v => ({
			pid: Number(v.user),
			timestamp: v.timestamp
		})),
		content: notif.text,
		imageUrl: notif.image
	};
}
