import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';
import type { Notification } from '@/api/generated';

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
