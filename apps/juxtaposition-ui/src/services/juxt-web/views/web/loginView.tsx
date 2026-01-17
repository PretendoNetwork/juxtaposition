import { WebLoginRoot } from '@/services/juxt-web/views/web/login';
import { PretendoLogo } from '@/services/juxt-web/views/web/icons';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type LoginViewProps = {
	ctx: RenderContext;
	toast?: string;
	redirect?: string;
};

export function WebLoginView(props: LoginViewProps): ReactNode {
	const extraHead = <title>Juxtaposition Log In</title>;

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
						<h2>Juxtaposition Sign in</h2>
						<p>Enter your account details below</p>
						<div>
							<label htmlFor="username">Username</label>
							<input name="username" id="username" required />
						</div>
						<div>
							<label htmlFor="password">Password</label>
							<input name="password" id="password" type="password" required />
							<a href="https://pretendo.network/account/forgot-password" className="pwdreset">Forgot your password?</a>
						</div>
						<input name="grant_type" id="grant_type" type="hidden" value="password" />
						<div className="buttons">
							<button type="submit">Login</button>
							<a href="https://pretendo.network/account/register" className="register">Don't have an account?</a>
						</div>
						<input type="hidden" name="redirect" value={props.redirect ?? '/'} />
					</form>
				</div>
			</div>
		</WebLoginRoot>
	);
}
