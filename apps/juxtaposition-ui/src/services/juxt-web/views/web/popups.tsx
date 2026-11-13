import { usePopupNotifications } from '@/services/juxt-web/views/common/hooks/useNotifications';
import { WebPopupNotification } from '@/services/juxt-web/views/web/components/WebPopupNotification';
import { WebPopupNotificationContainer } from '@/services/juxt-web/views/web/components/WebPopupNotificationContainer';
import type { ReactNode } from 'react';

export function WebPopupDisplay(): ReactNode {
	const notifications = usePopupNotifications();

	return (
		<WebPopupNotificationContainer>
			{notifications.map(v => <WebPopupNotification key={v.id} {...v} />)}
		</WebPopupNotificationContainer>
	);
}
