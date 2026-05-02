import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { CommunityIconProps } from '@/services/juxt-web/views/web/components/ui/WebCommunityIcon';

export function CtrCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const iconUrl = url.cdn(props.community.iconImagePaths[props.size]);

	return (
		<CtrIcon
			src={iconUrl}
			type={props.type}
			className={props.className}
		>
		</CtrIcon>
	);
}
