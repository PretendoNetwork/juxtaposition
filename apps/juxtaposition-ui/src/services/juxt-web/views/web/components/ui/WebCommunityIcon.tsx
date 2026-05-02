import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { Community } from '@/api/generated';

export type CommunityIconProps = {
	community: Community;
	size: `${keyof Community['iconImagePaths']}`;
	className?: string;
	type?: 'header-icon' | 'icon';
};

export function WebCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const iconUrl = url.cdn(props.community.iconImagePaths[props.size]);

	return (
		<WebIcon
			src={iconUrl}
			type="icon"
			className={props.className}
		>
		</WebIcon>
	);
}
