import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type CtrMiiIconProps = {
	ctx: RenderContext;

	pid: number;
	face_url?: string;
};

export function CtrMiiIcon(props: CtrMiiIconProps): ReactNode {
	const url = props.face_url ?? utils.cdn(props.ctx, `/mii/${props.pid}/normal_face.png`);

	return (
		<a href={`/users/${props.pid}`} className="mii-icon-container" data-pjax="#body">
			<img src={url} className="mii-icon" />
		</a>
	);
}
