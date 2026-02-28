/* eslint-disable no-restricted-imports -- raw import plugin does not support path aliases */
import devBadgeIcon from '../../assets/dev_badge.svg?raw';
import modBadgeIcon from '../../assets/mod_badge.svg?raw';
import starBadgeIcon from '../../assets/star_badge.svg?raw';
import testerBadgeIcon from '../../assets/tester_badge.svg?raw';
import birthdayIcon from '../../assets/birthday.svg?raw';
import countryIcon from '../../assets/country.svg?raw';
import followersIcon from '../../assets/followers.svg?raw';
import postsIcon from '../../assets/posts.svg?raw';
import skillIcon from '../../assets/skill.svg?raw';
import topicIcon from '../../assets/topic.svg?raw';
import type { ReactNode } from 'react';

const icons = {
	'dev-badge': devBadgeIcon,
	'mod-badge': modBadgeIcon,
	'star-badge': starBadgeIcon,
	'tester-badge': testerBadgeIcon,
	'birthday': birthdayIcon,
	'country': countryIcon,
	'followers': followersIcon,
	'posts': postsIcon,
	'skill': skillIcon,
	'topic': topicIcon
} as const;

type PortalUIIcon = keyof typeof icons;

export type PortalUIIconProps = {
	name: PortalUIIcon;
};

export function PortalUIIcon(props: PortalUIIconProps): ReactNode {
	const iconHtml = icons[props.name];
	return <span style={{ lineHeight: '0.7' }} dangerouslySetInnerHTML={{ __html: iconHtml }} />;
}
