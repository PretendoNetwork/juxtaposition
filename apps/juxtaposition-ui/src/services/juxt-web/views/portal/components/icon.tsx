import cx from 'classnames';
import type { ReactNode } from 'react';
import type { IconProps } from '@/services/juxt-web/views/web/components/icon';

export function PortalIconView(props: IconProps): ReactNode {
	const baseClass = props.baseClass ?? 'icon';
	return (
		<a href={props.href} className={cx(`${baseClass}-container`, props.className)} data-pjax="#body">
			<img src={props.src} className={baseClass} />
		</a>
	);
}
