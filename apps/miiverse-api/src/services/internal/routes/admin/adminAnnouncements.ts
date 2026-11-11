import { z } from 'zod';
import { createInternalApiRouter } from '@/services/internal/builder/router';
import { guards } from '@/services/internal/middleware/guards';
import { standardSortSchema, standardSortToPrisma } from '@/services/internal/contract/utils';
import { mapPage, pageControlSchema, pageDtoSchema } from '@/services/internal/contract/page';
import { errors } from '@/services/internal/errors';
import { mapResult, resultSchema } from '@/services/internal/contract/result';
import { genId } from '@/util';
import { adminAnnouncementSchema, mapAdminAnnouncement } from '@/services/internal/contract/admin/adminAnnouncements';
import type { SystemNotificationContent } from '@/services/internal/utils/notifications';

export const adminAnnouncementsRouter = createInternalApiRouter();

adminAnnouncementsRouter.get({
	path: '/admin/announcements',
	name: 'admin.announcements.list',
	guard: guards.moderator,
	schema: {
		query: z.object({
			sort: standardSortSchema
		}).extend(pageControlSchema(50)),
		response: pageDtoSchema(adminAnnouncementSchema)
	},
	async handler({ query, db }) {
		const announcements = await db.announcementNotification.findMany({
			take: query.limit,
			skip: query.offset,
			orderBy: {
				createdAt: standardSortToPrisma(query.sort)
			},
			include: {
				notification: true
			}
		});
		const total = await db.announcementNotification.count();

		return mapPage(total, announcements.map(v => mapAdminAnnouncement(v)));
	}
});

adminAnnouncementsRouter.post({
	path: '/admin/announcements',
	name: 'admin.announcements.create',
	description: 'Send an announcement to every user',
	guard: guards.developer,
	schema: {
		body: z.object({
			text: z.string()
		}),
		response: adminAnnouncementSchema
	},
	async handler({ db, body }) {
		// TODO add option for two types: changelogs and system
		const content: SystemNotificationContent = {
			link: '#',
			imagePath: '#',
			text: body.text // TODO add real content
		};
		const announcement = await db.announcementNotification.create({
			data: {
				id: genId(),
				notification: {
					create: {
						id: genId(),
						content,
						type: 'System',
						displayType: 'ListAndPopup'
					}
				}
			},
			include: {
				notification: true
			}
		});

		return mapAdminAnnouncement(announcement);
	}
});

adminAnnouncementsRouter.delete({
	path: '/admin/announcements/:id',
	name: 'admin.announcements.delete',
	guard: guards.developer,
	schema: {
		params: z.object({
			id: z.string()
		}),
		response: resultSchema
	},
	async handler({ params, db }) {
		const announcement = await db.announcementNotification.findFirst({
			where: {
				id: params.id
			}
		});
		if (!announcement) {
			throw errors.for('not_found');
		}

		await db.notification.delete({
			where: {
				id: announcement.notificationId
			}
		});

		return mapResult('success');
	}
});
