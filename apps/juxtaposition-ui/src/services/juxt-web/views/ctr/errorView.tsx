import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { InlineScript } from '@/services/juxt-web/views/common';
import type { ReactNode } from 'react';
import type { ErrorViewProps, FatalErrorViewProps } from '@/services/juxt-web/views/web/errorView';

export function CtrErrorView(props: ErrorViewProps): ReactNode {
	const title = `Error: ${props.code}`;

	return (
		<CtrRoot ctx={props.ctx} title={title}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title">
						Error
						{' '}
						{props.code}
						:
						{' '}
						{props.message}
					</h1>
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<p>Whoops! Looks like we couldn't find the page you're looking for.</p>
					<p>Double-check your link or try again later</p>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}

const errorJs = `
var e = document.getElementById('error');
var code = parseInt(e.getAttribute('data-code'));
var message = e.getAttribute('data-message');

cave.error_callFreeErrorViewer(code, message);
cave.closeApplication();
`;

export function CtrFatalErrorView(props: FatalErrorViewProps): ReactNode {
	return (
		<html>
			<head>
				<meta id="error" data-code={props.code} data-message={props.message} />
			</head>
			{/* Intentionally give some scroll area on 3DS */}
			<body style={{ width: '300px', minHeight: '800px', margin: 'auto' }}>
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
