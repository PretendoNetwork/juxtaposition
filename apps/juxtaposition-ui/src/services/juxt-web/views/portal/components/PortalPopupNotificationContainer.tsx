import type { ReactNode } from 'react';
import type { PopupNotificationContainerProps } from '@/services/juxt-web/views/web/components/WebPopupNotificationContainer';

export function PortalPopupNotificationContainer(props: PopupNotificationContainerProps): ReactNode {
	return (
		<div className="popup-notification-container" data-popup-notification-container>
			{props.children}
		</div>
	);
}
