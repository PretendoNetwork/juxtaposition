import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';

export type MiiIconProps = {
	pid: number;
	face_url?: string;
	link?: boolean; // default true

	type?: 'mii-icon' | 'icon' | 'header-icon'; // default ".mii-icon"
	className?: string; // extra classes
};

export function WebMiiIcon(props: MiiIconProps): ReactNode {
	const url = useUrl();
	const miiUrl = props.face_url ?? url.cdn(`/mii/${props.pid}/normal_face.png`);
	const href = props.link !== false ? `/users/${props.pid}` : undefined;
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
