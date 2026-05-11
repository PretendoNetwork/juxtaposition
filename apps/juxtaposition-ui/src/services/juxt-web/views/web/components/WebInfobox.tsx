import cx from 'classnames';
import { WebIcon } from '@/services/juxt-web/views/web/components/ui/WebIcon';
import { T } from '@/services/juxt-web/views/common/components/T';
import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import type { ReactNode } from 'react';

export type WebInfoboxProps = {
	bannerUrl?: string;
	iconUrl: string;
	title: string;

	followType?: 'title' | 'user';
	followId?: string;
	isFollowing?: boolean;

	children: ReactNode | ReactNode[];
};

export function WebInfobox(props: WebInfoboxProps): ReactNode {
	const followButton = props.followType
		? (
				<a
					href="#"
					role="button"
					aria-pressed={props.isFollowing ? 'true' : 'false'}
					className={cx('follow-button', {
						selected: props.isFollowing
					})}
					evt-click="follow(this)"
					data-url={props.followType === 'title' ? '/titles/follow' : '/users/follow'}
					data-community-id={props.followId}
					title={T.str('user_page.follow_user')}
				>
					<WebUIIcon name="heart" />
				</a>
			)
		: null;

	return (
		<div className="page-infobox">
			<img className="banner" src={props.bannerUrl ?? '/assets/web/images/banner.png'} />
			<div className="banner-content">
				<div className="title-line">
					<WebIcon src={props.iconUrl} type="header-icon" />
					<div className="title">{props.title}</div>
					{followButton}
				</div>
				{props.children}
			</div>
		</div>
	);
}

export type WebInfoboxButtonsProps = {
	children: ReactNode | ReactNode[];
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
	children: ReactNode | ReactNode[];
};

export function WebInfoboxButton(props: WebInfoboxButtonProps): ReactNode {
	return (
		<a className="button" href={props.href}>
			<span>{props.children}</span>
			<WebUIIcon name="right-arrow" />
		</a>
	);
}
