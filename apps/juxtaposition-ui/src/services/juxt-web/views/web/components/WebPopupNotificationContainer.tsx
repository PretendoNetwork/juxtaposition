import type { ReactNode } from 'react';

export type PopupNotificationContainerProps = {
	children?: ReactNode;
};

export function WebPopupNotificationContainer(props: PopupNotificationContainerProps): ReactNode {
	return (
		<div data-popup-notification-container>
			{props.children}
		</div>
	);
}
