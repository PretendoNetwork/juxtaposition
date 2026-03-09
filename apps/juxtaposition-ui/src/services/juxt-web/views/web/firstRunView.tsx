import { T } from '@/services/juxt-web/views/common/components/T';
import { WebLoginRoot } from '@/services/juxt-web/views/web/login';
import type { ReactNode } from 'react';

export type FirstRunViewProps = {
};

export function WebFirstRunView(_props: FirstRunViewProps): ReactNode {
	const extraHead = (
		<>
			<title>{T.str('login.title')}</title>
			<link rel="stylesheet" href="/assets/web/css/first_run.css" />
		</>
	);

	return (
		<WebLoginRoot head={extraHead}>
			<div className="wrapper">
				<div className="account-form-wrapper">
					<h2><T k="login.no_account_setup" /></h2>
				</div>
			</div>
		</WebLoginRoot>
	);
}
