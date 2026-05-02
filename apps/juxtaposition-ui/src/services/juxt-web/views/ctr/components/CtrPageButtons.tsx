import cx from 'classnames';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import { useEventProps } from '@/services/juxt-web/views/common/hooks/useEvents';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { EventProps } from '@/services/juxt-web/views/common/hooks/useEvents';

export type CtrPageButtonsProps = {
	children: ReactNode | ReactNode[];
};

export function CtrPageButtons(props: CtrPageButtonsProps): ReactNode {
	return (
		<div className="page-buttons">
			{props.children}
		</div>
	);
}

export type CtrPageButtonProps = DatasetProps & EventProps & {
	type: 'left' | 'middle' | 'right';

	href?: string;
	sprite?: string;

	children?: ReactNode | ReactNode[];
};

export function CtrPageButton(props: CtrPageButtonProps): ReactNode {
	const href = props.href ? { 'href': props.href, 'data-pjax': '#body' } : { tabIndex: 0 };
	const dataset = useDatasetProps(props);
	const events = useEventProps(props);

	return (
		<a className={cx('page-button', props.type)} {...href} {...dataset} {...events}>
			{props.sprite ? <span className={cx('sprite centred', props.sprite)}></span> : null}
			{props.children}
		</a>
	);
}
