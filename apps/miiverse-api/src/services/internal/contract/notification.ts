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
	const type = notif.type as NotificationType;

	const followUsers: NotificationDto['users'] = [];
	if (type === 'follow') {
		const pid = Number(notif.objectID);
		const user = users.find(u => u.pid === pid);
		followUsers.push({
			pid,
			timestamp: notif.lastUpdated, // Not actually correct, but whatever
			user: user ? mapShallowUser(user) : null
		});

		const restUsers = notif.users.map((v) => {
			const pid = Number(v.user);
			const user = users.find(u => u.pid === pid);
			return {
				pid,
				timestamp: v.timestamp,
				user: user ? mapShallowUser(user) : null
			};
		});
		followUsers.push(...restUsers);
	}

	return {
		toPid: Number(notif.pid),
		toUser: toUser ? mapShallowUser(toUser) : null,
		resourceId: notif.objectID,
		read: notif.read,
		updatedAt: notif.lastUpdated,
		link: notif.link,
		type,
		users: followUsers,
		content: notif.text,
		imageUrl: notif.image
	};
}
