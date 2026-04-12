import cx from 'classnames';
import type { ReactNode } from 'react';
import type { IconProps } from '@/services/juxt-web/views/web/components/ui/WebIcon';

export function PortalIcon(props: IconProps): ReactNode {
	const type = props.type ?? 'icon';

	const icon = <img src={props.src} className={type} />;
	if (props.href) {
		return (
			<a
				href={props.href}
				className={cx(`${type}-container`, props.className)}
				data-pjax="#body"
			>
				{icon}
			</a>
		);
	} else {
		return (
			<div
				className={cx(`${type}-container`, props.className)}
			>
				{icon}
			</div>
		);
	}
}
