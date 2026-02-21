import { CtrIcon } from '@/services/juxt-web/views/ctr/components/icon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { MiiIconProps } from '@/services/juxt-web/views/web/components/mii-icon';

export function CtrMiiIcon(props: MiiIconProps): ReactNode {
	const url = useUrl();

	const miiUrl = props.face_url ?? url.cdn(`/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const baseClass = !props.big ? 'mii-icon' : undefined;

	return (
		<CtrIcon
			ctx={props.ctx}
			href={href}
			src={miiUrl}
			baseClass={baseClass}
			className={props.className}
		>
		</CtrIcon>
	);
}
