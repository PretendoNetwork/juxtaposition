import cx from 'classnames';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type CtrIconProps = {
	ctx: RenderContext;

	src: string;
	href?: string;
	baseClass?: string; // default ".icon"
	className?: string; // extra classes
};

export function CtrIcon(props: CtrIconProps): ReactNode {
	const baseClass = props.baseClass ?? 'icon';
	return (
		<a href={props.href} className={cx(`${baseClass}-container`, props.className)} data-pjax="#body">
			<img src={props.src} className={baseClass} />
		</a>
	);
}
