import { z } from 'zod';
import { asOpenapi } from '@/services/internal/builder/openapi';
import { mapShallowUser, shallowUserSchema } from '@/services/internal/contract/user';
import type { INotification } from '@/types/mongoose/notification';
import type { HydratedSettingsDocument } from '@/types/mongoose/settings';

export const notificationTypeSchema = asOpenapi('NotificationType', z.enum(['follow', 'notice']));
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
	toPid: z.number(),
	toUser: shallowUserSchema.nullable(),
	resourceId: z.string(),
	link: z.string().nullable(),
	imageUrl: z.string(),
	content: z.string(),
	read: z.boolean(),
	updatedAt: z.date(),
	type: notificationTypeSchema,
	users: z.array(z.object({
		pid: z.number(),
		timestamp: z.date(),
		user: shallowUserSchema.nullable()
	}))
}).openapi('Notification');

export type NotificationDto = z.infer<typeof notificationSchema>;

export function mapNotification(notif: INotification, users: HydratedSettingsDocument[]): NotificationDto {
	const toUser = users.find(u => u.pid === Number(notif.pid));
	return {
		toPid: Number(notif.pid),
		toUser: toUser ? mapShallowUser(toUser) : null,
		resourceId: notif.objectID,
		read: notif.read,
		updatedAt: notif.lastUpdated,
		link: notif.link,
		type: notif.type as any,
		users: notif.users.map((v) => {
			const user = users.find(u => u.pid === Number(v.user));
			return {
				pid: Number(v.user),
				timestamp: v.timestamp,
				user: user ? mapShallowUser(user) : null
			};
		}),
		content: notif.text,
		imageUrl: notif.image
	};
}
