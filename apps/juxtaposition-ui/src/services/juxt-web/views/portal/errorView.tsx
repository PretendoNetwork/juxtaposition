import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { ErrorViewProps } from '@/services/juxt-web/views/web/errorView';

export function PortalErrorView(props: ErrorViewProps): ReactNode {
	const title = `Error: ${props.code}`;

	return (
		<PortalRoot title={title} onLoad="wiiuBrowser.endStartUp();">
			<PortalNavBar ctx={props.ctx} selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className=""></h1>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<div className="headline">
							<h2>
								Error
								{' '}
								{props.code}
								:
								{' '}
								{props.message}
							</h2>
						</div>
						<p>Whoops! Looks like we couldn't find the page you're looking for.</p>
						<p>Double-check your link or try again later</p>
						<img className="lost" src="/images/bandwidthlost.png" />
					</div>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
