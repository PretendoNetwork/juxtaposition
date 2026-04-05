import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { CommunitySchema } from '@/models/communities';

export type CommunityIconProps = {
	community: InferSchemaType<typeof CommunitySchema>;
	size: '32' | '48' | '64' | '96' | '128';
	className?: string;
};

export function WebCommunityIcon(props: CommunityIconProps): ReactNode {
	const url = useUrl();
	const imageId = props.community.parent ? props.community.parent : props.community.olive_community_id;
	const iconUrl = props.community.icon_paths ? url.cdn(props.community.icon_paths[props.size]) : url.cdn(`/icons/${imageId}/${props.size}.png`);
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
