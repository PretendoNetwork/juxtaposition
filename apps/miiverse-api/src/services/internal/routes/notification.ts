import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { mapNotification, notificationSchema } from '@/services/internal/contract/notification';
import type { EmpathyNotificationContent, FollowNotificationContent, ReplyNotificationContent } from '@/services/internal/utils/notifications';
import type { NotificationRecipientWhereInput } from '@/prisma/models';

export const notificationsRouter = createInternalApiRouter();

notificationsRouter.get({
	path: '/notifications',
	name: 'notifications.list',
	guard: guards.user,
	schema: {
		query: z.object({
			read: z.stringbool().optional(),
			markAsRead: z.stringbool().default(false)
		}).extend(pageControlSchema()),
		response: pageDtoSchema(notificationSchema)
	},
	async handler({ query, db, auth }) {
		const account = auth!;

		const dbQuery: NotificationRecipientWhereInput = {
			hasRead: query.read,
			pid: account.pnid.pid
		};
		const notifications = await db.notificationRecipient.findMany({
			where: dbQuery,
			take: query.limit,
			skip: query.offset,
			orderBy: {
				notification: {
					updatedAt: 'desc'
				}
			},
			include: {
				notification: true
			}
		});
		const total = await db.notificationRecipient.count({
			where: dbQuery
		});

		const relatedUserIds = notifications.reduce<number[]>((acc, v) => {
			acc.push(v.pid);
			if (v.notification.type === 'Follow' || v.notification.type === 'Empathy') {
				const content = v.notification.content as FollowNotificationContent | EmpathyNotificationContent;
				acc.push(...content.users.map(u => u.pid));
			}
			if (v.notification.type === 'Reply') {
				const content = v.notification.content as ReplyNotificationContent;
				acc.push(content.pid);
			}
			return acc;
		}, []);
		const users = await db.user.findMany({
			where: {
				pid: {
					in: relatedUserIds
				}
			}
		});

		if (query.markAsRead) {
			await db.notificationRecipient.updateMany({
				where: {
					id: {
						in: notifications.map(v => v.id)
					}
				},
				data: {
					hasRead: true
				}
			});
		}

		return mapPage(total, notifications.map(v => mapNotification(v, v.notification, users)));
	}
});
