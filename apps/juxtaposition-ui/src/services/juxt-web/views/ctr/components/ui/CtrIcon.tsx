import cx from 'classnames';
import type { ReactNode } from 'react';
import type { IconProps } from '@/services/juxt-web/views/web/components/ui/WebIcon';

export function CtrIcon(props: IconProps): ReactNode {
	const type = props.type ?? 'icon';
	return (
		<a href={props.href} className={cx(`${type}-container`, props.className)} data-pjax="#body">
			<img src={props.src} className={type} />
		</a>
	);
}
