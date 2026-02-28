import cx from 'classnames';
import { findDataset } from '@/services/juxt-web/views/common';
import type { ReactNode } from 'react';
import type { ButtonProps } from '@/services/juxt-web/views/web/components/ui/WebButton';

// todo: user/community follow buttons

export type CtrButtonProps = ButtonProps & {
	sprite?: string;
};

export function CtrButton(props: CtrButtonProps): ReactNode {
	const dataset = findDataset(props);
	const selected = { selected: props.selected };

	const button = (
		<button className={`${props.type}-button`} type="button" {...dataset}>
			{props.sprite ? <span className={cx('sprite centred', props.sprite, selected)} /> : null}
		</button>
	);

	return props.href
		? (
				<a href={props.href} data-pjax="#body">
					{button}
				</a>
			)
		: button;
}
