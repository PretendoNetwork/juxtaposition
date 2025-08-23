import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ReactNode } from 'react';

export type NewPostViewProps = {
	ctx: RenderContext;
	id: string;
	name: string;
	url: string;
	show: string;
	messagePid: number;
};

export function WebNewPostView(props: NewPostViewProps): ReactNode {
	return null;
}
