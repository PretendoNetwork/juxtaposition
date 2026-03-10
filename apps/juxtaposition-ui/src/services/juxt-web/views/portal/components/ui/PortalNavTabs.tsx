import cx from 'classnames';
import type { ReactNode } from 'react';
import type { NavTabProps, NavTabsProps, NavTabsRowProps } from '@/services/juxt-web/views/web/components/ui/WebNavTabs';

export function PortalNavTab(props: NavTabProps): ReactNode {
	const { selected, href } = props;
	return (
		<a className={cx('nav-tab', { selected })} href={href} data-nav-tab data-sound="SE_WAVE_SELECT_TAB">
			{props.children}
		</a>
	);
}

export function PortalNavTabsRow(props: NavTabsRowProps): ReactNode {
	return (
		<div className="nav-tabs-row">
			{props.children}
		</div>
	);
}

export function PortalNavTabs(props: NavTabsProps): ReactNode {
	return (
		<div className="nav-tabs" data-nav-tabs={props.target}>
			{props.children}
		</div>
	);
}
