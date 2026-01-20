import cx from 'classnames';
import type { ReactNode } from 'react';

export type CtrCheckboxProps = {
	// Form name
	name: string;
	// Form value
	value: string;
	// Is this the default?
	default?: boolean;
	// Which sprite to show on the button?
	sprite: string;
	// Actual shown/hidden content
	children?: ReactNode;
	// extra classNames
	className?: string;
};

// Checkbox with sprite
export function CtrCheckbox(props: CtrCheckboxProps): ReactNode {
	const selected = { selected: props.default };
	return (
		<div className={cx('checkbox', props.className, selected)}>
			<div className={cx('sprite', props.sprite, selected)}></div>
			<input
				type="checkbox"
				name={props.name}
				value={props.value}
				defaultChecked={props.default}
			/>
		</div>
	);
}
