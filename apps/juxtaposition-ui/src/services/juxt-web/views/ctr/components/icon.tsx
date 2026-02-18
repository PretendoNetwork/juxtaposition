import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type CtrIconProps = {
	ctx: RenderContext;

	src: string;
	href?: string;
	className?: string; // default ".icon"
};

export function CtrIcon(props: CtrIconProps): ReactNode {
	const className = props.className ?? 'icon';
	return (
		<a href={props.href} className={`${className}-container`} data-pjax="#body">
			<img src={props.src} className={className} />
		</a>
	);
}
