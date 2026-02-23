import { utils } from '@/services/juxt-web/views/utils';
import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import type { ReactNode } from 'react';
import type { MiiIconProps } from '@/services/juxt-web/views/web/components/ui/WebMiiIcon';

export function PortalMiiIcon(props: MiiIconProps): ReactNode {
	const url = props.face_url ?? utils.cdn(props.ctx, `/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const type = props.type ?? 'mii-icon';

	return (
		<PortalIcon
			ctx={props.ctx}
			href={href}
			src={url}
			type={type}
			className={props.className}
		>
		</PortalIcon>
	);
}
