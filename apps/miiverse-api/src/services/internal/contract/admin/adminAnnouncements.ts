import { z } from 'zod';
import { mapNotificationContent, notificationContentSchema } from '@/services/internal/contract/notification';
import type { AnnouncementNotification, Notification } from '@/prisma/client';

export const adminAnnouncementSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	notif: notificationContentSchema
}).openapi('AdminAnnouncement');

export type AdminAnnouncementDto = z.infer<typeof adminAnnouncementSchema>;

export function mapAdminAnnouncement(announcement: AnnouncementNotification & { notification: Notification }): AdminAnnouncementDto {
	return {
		id: announcement.id,
		createdAt: announcement.createdAt,
		notif: mapNotificationContent(announcement.notification, [])
	};
}
