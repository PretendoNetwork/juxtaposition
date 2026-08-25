import cx from 'classnames';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';

export type CtrListViewProps = {
	type: 'icon-column';
	className?: string; // extra classes
	id?: string;

	children: ReactNode[] | ReactNode;
};

export function CtrListView(props: CtrListViewProps): ReactNode {
	return (
		<ul id={props.id} className={cx('list-content-with-icon-column', props.className)}>
			{props.children}
		</ul>
	);
}

export type CtrListViewItemProps = DatasetProps & {
	href?: string;

	className?: string; // extra classes
	id?: string;

	children: ReactNode[] | ReactNode;
};

export function CtrListViewItem(props: CtrListViewItemProps): ReactNode {
	const dataset = useDatasetProps(props);
	const hasLink = !!props.href;

	return (
		<li id={props.id} className={cx('list-item', props.className, { box: !hasLink })} {...dataset}>
			{props.href
				? <a className="box" href={props.href} data-pjax="#body">{props.children}</a>
				: props.children}
		</li>
	);
}
