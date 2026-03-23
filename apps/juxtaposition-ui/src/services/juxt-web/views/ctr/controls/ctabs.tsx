import cx from 'classnames';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';

export type CtrTabViewProps = DatasetProps & {
	// Shared name for all tabs.
	name: string;
	// Form value for this specific tab.
	value: string;
	// Is this the default?
	default?: boolean;
	// Which sprite to show on the button?
	sprite: string;
	// Actual shown/hidden content
	children?: ReactNode;
};

// Client-side tab control
export function CtrTabView(props: CtrTabViewProps): ReactNode {
	const dataset = useDatasetProps(props);
	const selected = { selected: props.default };
	return (
		<>
			<li className={cx('ctab', selected)} data-ctab="1" {...dataset}>
				<div className={cx('sprite', 'centred', props.sprite, selected)}></div>
				<input
					type="radio"
					name={props.name}
					value={props.value}
					defaultChecked={props.default}
				/>
			</li>
			{
				props.children
					? <div className="ctab-content" data-ctab-content={props.value}>{props.children}</div>
					: {}
			}
		</>
	);
}

export type CtrTabsViewProps = {
	className?: string;
	children: ReactNode;
};

export function CtrTabsView(props: CtrTabsViewProps): ReactNode {
	return (
		<menu className={cx('ctabs', props.className)} data-ctabs-control="1">
			{props.children}
		</menu>
	);
}
