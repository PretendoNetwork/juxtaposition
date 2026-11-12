import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';
import type { Notification } from '@/api/generated';
import type { PopupNotificationProps } from '@/services/juxt-web/views/web/components/WebPopupNotification';

export type useNotificationValue = {
	unreadCount: number;
	popups: Notification[];
	announcements: Notification[];
};

export function useNotifications(): useNotificationValue {
	const ctx = useRenderContext();
	return {
		unreadCount: ctx.notifications?.counts.unreadNotifications ?? 0,
		popups: ctx.notifications?.popups ?? [],
		announcements: ctx.notifications?.announcements ?? []
	};
}

export function usePopupNotifications(): PopupNotificationProps[] {
	const notifications = useNotifications();
	const popups = notifications.popups.map(v => ({
		id: v.id,
		notification: v.notif,
		popupType: 'notification'
	} satisfies PopupNotificationProps));
	const announcements = notifications.announcements.map(v => ({
		id: v.id,
		notification: v.notif,
		popupType: 'announcement'
	} satisfies PopupNotificationProps));
	return [
		...popups,
		...announcements
	];
}
