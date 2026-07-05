import { z } from 'zod';
import { guards } from '@/services/internal/middleware/guards';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { deleteOptional } from '@/services/internal/utils';
import { Notification } from '@/models/notification';
import { mapNotification, notificationSchema } from '@/services/internal/contract/notification';
import { Settings } from '@/models/settings';
import type { RootFilterQuery } from 'mongoose';
import type { INotification } from '@/types/mongoose/notification';

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
	async handler({ query, auth }) {
		const account = auth!;

		const dbQuery: RootFilterQuery<INotification> = deleteOptional({
			read: query.read,
			pid: account.pnid.pid
		});
		const notifications = await Notification
			.find(dbQuery)
			.sort({ lastUpdated: -1 })
			.limit(query.limit)
			.skip(query.offset);
		const total = await Notification.countDocuments(dbQuery);

		const relatedUserIds = notifications.reduce<number[]>((acc, v) => {
			acc.push(Number(v.pid));
			acc.push(...v.users.map(u => Number(u.user)));
			return acc;
		}, []);
		const users = await Settings.find({ pid: { $in: relatedUserIds } });

		if (query.markAsRead) {
			await Notification.updateMany({
				_id: {
					$in: notifications.map(v => v._id)
				}
			}, {
				$set: {
					read: true
				}
			});
		}

		return mapPage(total, notifications.map(v => mapNotification(v, users)));
	}
});
