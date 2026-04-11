import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { Community } from '@/api/generated';

export type CommunityIconProps = {
	community: Community;
	size: `${keyof Community['iconImagePaths']}`;
	className?: string;
};

export function WebCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const iconUrl = url.cdn(props.community.iconImagePaths[props.size]);
	const href = `/communities/${props.community.olive_community_id}`;

	return (
		<WebIcon
			href={href}
			src={iconUrl}
			type="icon"
			className={props.className}
		>
		</WebIcon>
	);
}
