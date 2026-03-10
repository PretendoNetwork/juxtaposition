import { WebLoginRoot } from '@/services/juxt-web/views/web/login';
import { PretendoLogo } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';

export type LoginViewProps = {
	toast?: string;
	redirect?: string;
};

export function WebLoginView(props: LoginViewProps): ReactNode {
	const extraHead = <title>{T.str('login.title')}</title>;

	return (
		<WebLoginRoot head={extraHead}>
			<div id="toast" data-show={props.toast ? 'true' : undefined}>
				{props.toast}
			</div>
			<div className="wrapper">
				<div className="account-form-wrapper">
					<a className="logotype" href="https://pretendo.network">
						<PretendoLogo />
					</a>
					<form action="/login" method="post" className="account">
						<h2><T k="login.heading" /></h2>
						<p><T k="login.sub_title" /></p>
						<div>
							<label htmlFor="username"><T k="login.username" /></label>
							<input name="username" id="username" required />
						</div>
						<div>
							<label htmlFor="password"><T k="login.password" /></label>
							<input name="password" id="password" type="password" required />
							<a href="https://pretendo.network/account/forgot-password" className="pwdreset"><T k="login.forgot_password" /></a>
						</div>
						<input name="grant_type" id="grant_type" type="hidden" value="password" />
						<div className="buttons">
							<button type="submit"><T k="login.login_action" /></button>
							<a href="https://pretendo.network/account/register" className="register"><T k="login.no_account" /></a>
						</div>
						<input type="hidden" name="redirect" value={props.redirect ?? '/'} />
					</form>
				</div>
			</div>
		</WebLoginRoot>
	);
}
