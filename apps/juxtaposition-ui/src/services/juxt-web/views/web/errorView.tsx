import { WebLoginRoot } from '@/services/juxt-web/views/web/login';
import { PretendoLogo } from '@/services/juxt-web/views/web/icons';
import type { ReactNode } from 'react';
import type { ReqId } from 'pino-http';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type ErrorViewProps = {
	ctx: RenderContext;
	requestId: ReqId;
	code: string | number;
	message: string;
};

export type FatalErrorViewProps = {
	code: string | number;
	message: string;
};

export function WebErrorView(props: ErrorViewProps): ReactNode {
	const extraHead = <title>Juxt - Error</title>;

	return (
		<WebLoginRoot head={extraHead}>
			<div className="wrapper">
				<div className="account-form-wrapper">
					<a className="logotype" href="/">
						<PretendoLogo />
					</a>
					<h2>
						{props.code}
						:
						{' '}
						{props.message}
					</h2>
					<h3>
						View current
						{' '}
						<a href="https://stats.uptimerobot.com/R7E4wiGjJq">server status</a>
						.
					</h3>
					<h3>
						Or,
						{' '}
						<a href="/">go back to the homepage</a>
						.
					</h3>
					<p>
						Request ID:
						{' '}
						{props.requestId.toString()}
					</p>
				</div>
			</div>
		</WebLoginRoot>
	);
}
