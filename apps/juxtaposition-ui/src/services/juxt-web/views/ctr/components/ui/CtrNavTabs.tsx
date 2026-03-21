import cx from 'classnames';
import type { ReactNode } from 'react';
import type { NavTabProps, NavTabsProps, NavTabsRowProps } from '@/services/juxt-web/views/web/components/ui/WebNavTabs';

export function CtrNavTab(props: NavTabProps): ReactNode {
	const { selected, href } = props;
	return (
		<a className={cx('nav-tab', { selected })} href={href} data-nav-tab>
			{props.children}
		</a>
	);
}

export function CtrNavTabsRow(props: NavTabsRowProps): ReactNode {
	return (
		<div className="nav-tabs-row">
			{props.children}
		</div>
	);
}

export function CtrNavTabs(props: NavTabsProps): ReactNode {
	return (
		<div className="nav-tabs" data-nav-tabs={props.target}>
			{props.children}
		</div>
	);
}
