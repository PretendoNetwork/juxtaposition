import { utils } from '@/services/juxt-web/views/utils';
import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type MiiIconProps = {
	ctx: RenderContext;

	pid: number;
	face_url?: string;

	type?: 'mii-icon' | 'icon'; // default ".mii-icon"
	className?: string; // extra classes
};

export function WebMiiIcon(props: MiiIconProps): ReactNode {
	const url = props.face_url ?? utils.cdn(props.ctx, `/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const type = props.type ?? 'mii-icon';

	return (
		<WebIcon
			ctx={props.ctx}
			href={href}
			src={url}
			type={type}
			className={props.className}
		>
		</WebIcon>
	);
}
