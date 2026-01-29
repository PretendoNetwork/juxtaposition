import cx from 'classnames';
import type { ReactNode } from 'react';

export type CtrTabViewProps = {
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
	const selected = { selected: props.default };
	return (
		<>
			<li className={cx('ctab', selected)}>
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
					? <div className="ctab-content" data-value={props.value}>{props.children}</div>
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
		<menu className={cx('ctabs', props.className)}>
			{props.children}
		</menu>
	);
}
