import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { CommunityIconProps } from '@/services/juxt-web/views/web/components/ui/WebCommunityIcon';

export function PortalCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const imageId = props.community.parent ? props.community.parent : props.community.olive_community_id;
	const iconUrl = props.community.icon_paths ? url.cdn(props.community.icon_paths[props.size]) : url.cdn(`/icons/${imageId}/${props.size}.png`);

	return (
		<PortalIcon
			src={iconUrl}
			type="icon"
			className={props.className}
		>
		</PortalIcon>
	);
}
