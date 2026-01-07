import { WebLoginRoot } from '@/services/juxt-web/views/web/login';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type FirstRunViewProps = {
	ctx: RenderContext;
};

export function WebFirstRunView(_props: FirstRunViewProps): ReactNode {
	const extraHead = <title>Juxtaposition Log In</title>;
	return (
		<WebLoginRoot head={extraHead}>
			<div className="wrapper">
				<div className="account-form-wrapper">
					<h2>Account Creation is only available when you have a linked Wii U or 3DS.</h2>
				</div>
			</div>
		</WebLoginRoot>
	);
}
