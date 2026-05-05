import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { Inline } from '@/services/juxt-web/views/common/components/Inline';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { ErrorViewProps, FatalErrorViewProps } from '@/services/juxt-web/views/web/errorView';

export function CtrErrorView(props: ErrorViewProps): ReactNode {
	const title = T.str('error.title', { code: props.code });

	return (
		<CtrRoot title={title}>
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="normal"
					data-toolbar-active-button="0"
				>
					<T k="error.heading" values={{ code: props.code, message: props.message }} />
				</CtrPageTitledHeader>
				<div className="body-content tab2-content" id="community-post-list">
					<p><T k="error.message" withNewline /></p>
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
					<T k="error.no_access" values={{ code: props.code }} />
				</h1>
				<p style={{ whiteSpace: 'pre-line' }}>{props.message}</p>
			</body>
			<Inline.Script src={errorJs} />
		</html>
	);
}
