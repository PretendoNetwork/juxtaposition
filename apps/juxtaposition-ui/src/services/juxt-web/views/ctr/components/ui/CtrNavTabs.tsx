import cx from 'classnames';
import type { ReactNode } from 'react';

export type CtrNavTabProps = {
	href: string;
	selected?: boolean;

	children: ReactNode[] | ReactNode;
};

export function CtrNavTab(props: CtrNavTabProps): ReactNode {
	const { selected, href } = props;
	return (
		<a className={cx('nav-tab', { selected })} href={href} data-nav-tab>
			{props.children}
		</a>
	);
}

export type CtrNavTabsRowProps = {
	children: ReactNode[] | ReactNode;
};

export function CtrNavTabsRow(props: CtrNavTabsRowProps): ReactNode {
	return (
		<div className="nav-tabs-row">
			{props.children}
		</div>
	);
}

export type CtrNavTabsProps = {
	children: ReactNode[] | ReactNode;

	target: string; // Selector
};

export function CtrNavTabs(props: CtrNavTabsProps): ReactNode {
	return (
		<div className="nav-tabs" data-nav-tabs={props.target}>
			{props.children}
		</div>
	);
}
