import cx from 'classnames';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';

export type PortalListViewProps = {
	type: 'table-3col' | 'list';
	className?: string; // extra classes
	id?: string;

	children: ReactNode[] | ReactNode;
};

export function PortalListView(props: PortalListViewProps): ReactNode {
	return (
		<ul id={props.id} className={cx('list-view', props.type, props.className)}>
			{props.children}
		</ul>
	);
}

export type PortalListViewItemProps = DatasetProps & {
	href?: string;

	className?: string; // extra classes
	id?: string;

	children: ReactNode[] | ReactNode;
};

export function PortalListViewItem(props: PortalListViewItemProps): ReactNode {
	const dataset = useDatasetProps(props);

	return (
		<li id={props.id} className={cx('list-item', props.className)} {...dataset}>
			{props.href
				? <a className="box" href={props.href} data-pjax="#body">{props.children}</a>
				: <div className="box">{props.children}</div>}
		</li>
	);
}
