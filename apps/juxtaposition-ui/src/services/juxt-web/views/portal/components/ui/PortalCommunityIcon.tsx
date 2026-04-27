import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { CommunityIconProps } from '@/services/juxt-web/views/web/components/ui/WebCommunityIcon';

export function PortalCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const iconUrl = url.cdn(props.community.iconImagePaths[props.size]);

	return (
		<PortalIcon
			src={iconUrl}
			type="icon"
			className={props.className}
		>
		</PortalIcon>
	);
}
