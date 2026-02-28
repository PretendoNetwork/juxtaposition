import cx from 'classnames';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type IconProps = {
	ctx: RenderContext;

	src: string;
	href?: string;

	type?: 'icon' | 'mii-icon'; // default ".icon"
	className?: string; // extra classes
};

export function WebIcon(props: IconProps): ReactNode {
	const type = props.type ?? 'icon';
	return (
		<a href={props.href} className={cx(`${type}-container`, props.className)}>
			<img src={props.src} className={type} />
		</a>
	);
}
