import cx from 'classnames';
import type { ReactNode } from 'react';

export type IconProps = {
	src: string;
	href?: string;

	type?: 'icon' | 'mii-icon' | 'header-icon'; // default ".icon"
	className?: string; // extra classes
};

export function WebIcon(props: IconProps): ReactNode {
	const type = props.type ?? 'icon';

	const icon = <img src={props.src} className={type} />;
	if (props.href) {
		return (
			<a
				href={props.href}
				className={cx(`${type}-container`, props.className)}
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
