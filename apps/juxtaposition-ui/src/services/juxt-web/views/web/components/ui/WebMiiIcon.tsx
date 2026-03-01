import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';

export type MiiIconProps = {
	pid: number;
	face_url?: string;

	type?: 'mii-icon' | 'icon'; // default ".mii-icon"
	className?: string; // extra classes
};

export function WebMiiIcon(props: MiiIconProps): ReactNode {
	const url = useUrl();
	const miiUrl = props.face_url ?? url.cdn(`/mii/${props.pid}/normal_face.png`);
	const href = `/users/${props.pid}`;
	const type = props.type ?? 'mii-icon';

	return (
		<WebIcon
			href={href}
			src={miiUrl}
			type={type}
			className={props.className}
		>
		</WebIcon>
	);
}
