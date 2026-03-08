import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import { Inline } from '@/services/juxt-web/views/common/components/Inline';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { ErrorViewProps, FatalErrorViewProps } from '@/services/juxt-web/views/web/errorView';

export function PortalErrorView(props: ErrorViewProps): ReactNode {
	const title = `Error: ${props.code}`;

	return (
		<PortalRoot title={title} onLoad="wiiuBrowser.endStartUp();">
			<PortalNavBar selection={-1} />
			<PortalPageBody>
				<header id="header">
					<h1 id="page-title" className=""></h1>
				</header>
				<div className="body-content">
					<div className="communities-list">
						<div className="headline">
							<h2>
								<T k="error.heading" values={{ code: props.code, message: props.message }} />
							</h2>
						</div>
						<p><T k="error.message" withNewline /></p>
						<img className="lost" src="/assets/portal/images/bandwidthlost.png" />
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
					<T k="error.no_access" values={{ code: props.code }} />
				</h1>
				<p style={{ whiteSpace: 'pre-line' }}>{props.message}</p>
			</body>
			<Inline.Script src={errorJs} />
		</html>
	);
}
