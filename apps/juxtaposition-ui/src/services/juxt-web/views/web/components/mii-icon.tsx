import type { RenderContext } from '@/services/juxt-web/views/context';

export type MiiIconProps = {
	ctx: RenderContext;

	pid: number;
	face_url?: string;
	big?: boolean; // Use .icon (Icon) instead of .mii-icon
	className?: string; // extra classes
};
