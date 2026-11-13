import { usePopupNotifications } from '@/services/juxt-web/views/common/hooks/useNotifications';
import { PortalPopupNotification } from '@/services/juxt-web/views/portal/components/PortalPopupNotification';
import { PortalPopupNotificationContainer } from '@/services/juxt-web/views/portal/components/PortalPopupNotificationContainer';
import type { ReactNode } from 'react';

export function PortalPopupDisplay(): ReactNode {
	const notifications = usePopupNotifications();

	return (
		<PortalPopupNotificationContainer>
			{notifications.map(v => <PortalPopupNotification key={v.id} {...v} />)}
		</PortalPopupNotificationContainer>
	);
}
