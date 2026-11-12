import type { ReactNode } from 'react';

export type PopupNotificationContainerProps = {
	children?: ReactNode;
};

export function WebPopupNotificationContainer(props: PopupNotificationContainerProps): ReactNode {
	return (
		<div className="popup-notification-container" data-popup-notification-container>
			{props.children}
		</div>
	);
}
