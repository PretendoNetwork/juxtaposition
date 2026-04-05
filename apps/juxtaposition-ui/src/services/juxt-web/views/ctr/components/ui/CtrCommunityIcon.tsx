import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { CommunityIconProps } from '@/services/juxt-web/views/web/components/ui/WebCommunityIcon';

export function CtrCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const imageId = props.community.parent ? props.community.parent : props.community.olive_community_id;
	const iconUrl = props.community.icon_paths ? url.cdn(props.community.icon_paths[props.size]) : url.cdn(`/icons/${imageId}/${props.size}.png`);
	const href = `/communities/${props.community.olive_community_id}`;

	return (
		<CtrIcon
			href={href}
			src={iconUrl}
			type="icon"
			className={props.className}
		>
		</CtrIcon>
	);
}
