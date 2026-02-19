import { utils } from '@/services/juxt-web/views/utils';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/icon';
import type { ReactNode } from 'react';
import type { MiiIconProps } from '@/services/juxt-web/views/web/components/mii-icon';

export function CtrMiiIcon(props: MiiIconProps): ReactNode {
	const url = props.face_url ?? utils.cdn(props.ctx, `/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const baseClass = !props.big ? 'mii-icon' : undefined;

	return (
		<CtrIcon
			ctx={props.ctx}
			href={href}
			src={url}
			baseClass={baseClass}
			className={props.className}
		>
		</CtrIcon>
	);
}
