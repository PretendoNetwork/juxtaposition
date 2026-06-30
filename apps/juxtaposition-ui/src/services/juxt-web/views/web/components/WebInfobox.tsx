import cx from 'classnames';
import { T } from '@/services/juxt-web/views/common/components/T';
import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import type { ReactNode } from 'react';

export type WebInfoboxProps = {
	bannerUrl?: string;
	children: ReactNode;
};

export function WebInfobox(props: WebInfoboxProps): ReactNode {
	return (
		<div className="page-infobox">
			<img className="banner" src={props.bannerUrl ?? '/assets/web/images/banner.png'} />
			<div className="banner-content">
				{props.children}
			</div>
		</div>
	);
}

export type WebInfoboxFollowButtonProps = {
	followType?: 'title' | 'user';
	followId?: string | number;
	isFollowing?: boolean;
};

export function WebInfoboxFollowButton(props: WebInfoboxFollowButtonProps): ReactNode {
	return (
		<a
			href="#"
			role="button"
			aria-pressed={props.isFollowing ? 'true' : 'false'}
			className={cx('follow-button', {
				selected: props.isFollowing
			})}
			evt-click="follow(this)"
			data-url={props.followType === 'title' ? '/titles/follow' : '/users/follow'}
			data-community-id={`${props.followId}`}
			title={T.str('user_page.follow_user')}
		>
			<WebUIIcon name="heart" />
		</a>
	);
}

export type WebInfoboxButtonsProps = {
	children: ReactNode;
};

export function WebInfoboxButtons(props: WebInfoboxButtonsProps): ReactNode {
	return (
		<div className="page-infobox-buttons">
			{props.children}
		</div>
	);
}

export type WebInfoboxButtonProps = {
	href?: string;
	children: ReactNode;
};

export function WebInfoboxButton(props: WebInfoboxButtonProps): ReactNode {
	return (
		<a className="button" href={props.href}>
			<span>{props.children}</span>
			<WebUIIcon name="right-arrow" />
		</a>
	);
}

export type WebInfoboxStatBoxesProps = {
	children: ReactNode;
};

export function WebInfoboxStatBoxes(props: WebInfoboxStatBoxesProps): ReactNode {
	const itemCount = Array.isArray(props.children) ? props.children.length : 1;
	const even = itemCount % 2 == 0;
	return (
		<div className={cx('stat-boxes', {
			'cols-2': even && itemCount % 3 != 0,
			'cols-3': !even || itemCount % 3 == 0
		})}
		>
			{props.children}
		</div>
	);
}
