import { utils } from '@/services/juxt-web/views/utils';
import { PortalIconView } from '@/services/juxt-web/views/portal/components/icon';
import type { ReactNode } from 'react';
import type { MiiIconProps } from '@/services/juxt-web/views/web/components/mii-icon';

export function PortalMiiIcon(props: MiiIconProps): ReactNode {
	const url = props.face_url ?? utils.cdn(props.ctx, `/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const baseClass = !props.big ? 'mii-icon' : undefined;

	return (
		<PortalIconView
			ctx={props.ctx}
			href={href}
			src={url}
			baseClass={baseClass}
			className={props.className}
		>
		</PortalIconView>
	);
}
