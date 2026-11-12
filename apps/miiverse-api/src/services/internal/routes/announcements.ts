import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { mapNotificationContent, notificationSchema } from '@/services/internal/contract/notification';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { errors } from '@/services/internal/errors';
import type { NotificationDto } from '@/services/internal/contract/notification';

export const announcementsRouter = createInternalApiRouter();

announcementsRouter.get({
	path: '/announcements/unread',
	name: 'announcements.getUnread',
	guard: guards.user,
	schema: {
		response: z.array(notificationSchema)
	},
	async handler({ db, auth }) {
		const account = auth!;

		// Currently we only allow users to view the newest unread announcement, so only return that one
		const newestAnnouncement = await db.announcementNotification.findFirst({
			where: {
				createdAt: account.user?.announcementsLastSeenAt
					? {
							gt: account.user.announcementsLastSeenAt
						}
					: undefined
			},
			orderBy: {
				createdAt: 'desc'
			},
			include: {
				notification: true
			}
		});

		if (!newestAnnouncement) {
			return [];
		}

		const notifDto: NotificationDto = {
			id: newestAnnouncement.id,
			hasRead: false,
			pid: account.pnid.pid,
			notif: mapNotificationContent(newestAnnouncement.notification, []),
			updatedAt: newestAnnouncement.createdAt
		};
		return [notifDto];
	}
});

announcementsRouter.post({
	path: '/announcements/:id/read',
	name: 'announcements.markAsRead',
	guard: guards.user,
	schema: {
		params: z.object({
			id: z.string()
		}),
		response: resultSchema
	},
	async handler({ params, db, auth }) {
		const account = auth!;

		const announcement = await db.announcementNotification.findFirst({
			where: {
				id: params.id
			}
		});
		if (!announcement) {
			throw errors.for('not_found');
		}

		await db.user.update({
			where: {
				pid: account.pnid.pid
			},
			data: {
				announcementsLastSeenAt: announcement.createdAt
			}
		});

		return mapResult('success');
	}
});
