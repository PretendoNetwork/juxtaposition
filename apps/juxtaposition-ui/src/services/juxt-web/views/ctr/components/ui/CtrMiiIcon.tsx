import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import type { ReactNode } from 'react';
import type { MiiIconProps } from '@/services/juxt-web/views/web/components/ui/WebMiiIcon';

export function CtrMiiIcon(props: MiiIconProps): ReactNode {
	const url = useUrl();
	const miiUrl = props.face_url ?? url.cdn(`/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const type = props.type ?? 'mii-icon';

	return (
		<CtrIcon
			href={href}
			src={miiUrl}
			type={type}
			className={props.className}
		>
		</CtrIcon>
	);
}
