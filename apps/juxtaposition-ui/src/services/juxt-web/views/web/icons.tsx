/* eslint-disable no-restricted-imports -- raw import plugin does not support path aliases */
import heartIcon from './assets/heart_icon.svg?raw';
import replyIcon from './assets/reply_icon.svg?raw';
import menuIcon from './assets/menu_icon.svg?raw';
import flagIcon from './assets/flag_icon.svg?raw';
import binIcon from './assets/bin_icon.svg?raw';
import shareIcon from './assets/share_icon.svg?raw';
import devBadgeIcon from './assets/dev_badge.svg?raw';
import modBadgeIcon from './assets/mod_badge.svg?raw';
import starBadgeIcon from './assets/star_badge.svg?raw';
import testerBadgeIcon from './assets/tester_badge.svg?raw';
import juxtLogoSvg from './assets/juxt_logo.svg?raw';
import pretendoLogoSvg from './assets/pretendo_logo.svg?raw';
import mailIcon from './assets/mail.svg?raw';
import bellIcon from './assets/bell.svg?raw';
import usersIcon from './assets/users.svg?raw';
import homeIcon from './assets/home.svg?raw';
import hammerIcon from './assets/hammer.svg?raw';
import type { ReactNode } from 'react';

const icons = {
	'dev-badge': devBadgeIcon,
	'mod-badge': modBadgeIcon,
	'star-badge': starBadgeIcon,
	'tester-badge': testerBadgeIcon,
	'heart': heartIcon,
	'reply': replyIcon,
	'menu': menuIcon,
	'flag': flagIcon,
	'bin': binIcon,
	'share': shareIcon,
	'mail': mailIcon,
	'bell': bellIcon,
	'users': usersIcon,
	'home': homeIcon,
	'hammer': hammerIcon
} as const;

type WebIcon = keyof typeof icons;

export type WebIconProps = {
	name: WebIcon;
};

export function WebIcon(props: WebIconProps): ReactNode {
	const iconHtml = icons[props.name];
	return (
		<span
			role="img"
			aria-label={`${props.name} icon`}
			style={{ lineHeight: '0.7' }}
			dangerouslySetInnerHTML={{ __html: iconHtml }}
		/>
	);
}

export function PretendoLogo(): ReactNode {
	return (
		<span dangerouslySetInnerHTML={{ __html: pretendoLogoSvg }} />
	);
}

export function JuxtLogo(): ReactNode {
	return (
		<span dangerouslySetInnerHTML={{ __html: juxtLogoSvg }} />
	);
}
