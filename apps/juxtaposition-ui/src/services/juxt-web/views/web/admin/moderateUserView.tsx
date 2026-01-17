import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type ModerateUserViewProps = {
	ctx: RenderContext;
	id: string;
	name: string;
	url: string;
	show: string;
	messagePid: number;
};

export function WebModerateUserView(props: ModerateUserViewProps): ReactNode {
	return <></>;
}
