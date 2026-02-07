import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { InlineScript } from '@/services/juxt-web/views/common';
import type { ReactNode } from 'react';
import type { ErrorViewProps, FatalErrorViewProps } from '@/services/juxt-web/views/web/errorView';

export function PortalErrorView(props: ErrorViewProps): ReactNode {
	const title = `Error: ${props.code}`;

	return (
		<PortalRoot ctx={props.ctx} title={title} onLoad="wiiuBrowser.endStartUp();">
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

const errorJs = `
var e = document.getElementById('error');
var code = parseInt(e.getAttribute('data-code'));
var message = e.getAttribute('data-message');

wiiuErrorViewer.openByCodeAndMessage(code, message);
wiiuBrowser.closeApplication();
`;

export function PortalFatalErrorView(props: FatalErrorViewProps): ReactNode {
	return (
		<html>
			<head>
				<meta id="error" data-code={props.code} data-message={props.message} />
			</head>
			<body>
				<h1>
					You are not authorized to access this application (
					{props.code}
					)
				</h1>
				<p style={{ whiteSpace: 'pre-line' }}>{props.message}</p>
			</body>
			<InlineScript src={errorJs} />
		</html>
	);
}
