import type { RenderContext } from '@/services/juxt-web/views/context';

export type IconProps = {
	ctx: RenderContext;

	src: string;
	href?: string;
	baseClass?: string; // default ".icon"
	className?: string; // extra classes
};
