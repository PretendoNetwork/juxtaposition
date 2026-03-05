import cx from 'classnames';
import type { ReactNode } from 'react';

export type IconProps = {
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
