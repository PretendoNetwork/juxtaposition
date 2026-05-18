import cx from 'classnames';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import type { ReactNode } from 'react';

export type CtrPjaxFormProps = {
	id?: string;
	className?: string;

	action: string;

	children: ReactNode | ReactNode[];
};

export function CtrPjaxForm(props: CtrPjaxFormProps): ReactNode {
	const url = useUrl();
	return (
		<form
			id={props.id}
			className={cx('pjax-form', props.className)}
			data-pjax-form

			// There's a secret "pjax-submit" iframe in root.tsx
			target="pjax-submit"
			method="post"
			encType="multipart/form-data"
			action={url.url(props.action, { pjax_api: true })}
		>
			{props.children}
			{/* This gets "clicked" by the toolbar */}
			<input type="submit" id="submit" />
		</form>
	);
}
