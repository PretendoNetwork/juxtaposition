/* eslint-disable no-restricted-imports -- raw import plugin does not support path aliases */
import heartIcon from '../../../../webfiles/web/partials/assets/heart_icon.svg?raw';
import replyIcon from '../../../../webfiles/web/partials/assets/reply_icon.svg?raw';
import menuIcon from '../../../../webfiles/web/partials/assets/menu_icon.svg?raw';
import flagIcon from '../../../../webfiles/web/partials/assets/flag_icon.svg?raw';
import binIcon from '../../../../webfiles/web/partials/assets/bin_icon.svg?raw';
import shareIcon from '../../../../webfiles/web/partials/assets/share_icon.svg?raw';
import type { ReactNode } from 'react';

const icons = {
	heart: heartIcon,
	reply: replyIcon,
	menu: menuIcon,
	flag: flagIcon,
	bin: binIcon,
	share: shareIcon
} as const;

type WebIcon = keyof typeof icons;

export type WebIconProps = {
	name: WebIcon;
};

export function WebIcon(props: WebIconProps): ReactNode {
	const iconHtml = icons[props.name];
	return <span style={{ lineHeight: '0.7' }} dangerouslySetInnerHTML={{ __html: iconHtml }} />;
}
