import { useRequest } from '@/services/juxt-web/views/common/hooks/useRequest';
import type { ReactNode } from 'react';

export type DefaultHeadProps = {
	preventJsLoad?: boolean;
};

function DefaultHead(props: DefaultHeadProps): ReactNode {
	const req = useRequest();
	const loadJs = !props.preventJsLoad;
	const addDebugJs = !req.userAgent.isConsole; // Only serve debug js to non-console browsers
	return (
		<>
			<link rel="stylesheet" type="text/css" href="/assets/ctr/css/juxt.css" />
			{/* Debug allows non-console browsers to have some amount of the cave API. */}
			{addDebugJs ? <script src="/assets/ctr/js/debug.global.js"></script> : null}
			{/* Non-console browsers probably want this too. */}
			{addDebugJs ? <meta name="viewport" content="width=device-width, initial-scale=1.0" /> : null}
			{loadJs ? <script src="/assets/ctr/js/juxt.global.js"></script> : null}
		</>
	);
}

export type HtmlProps = {
	children?: ReactNode;
	head?: ReactNode;
	title: string;
	onLoad?: string;
	preventJsLoad?: boolean;
};

export function CtrRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead preventJsLoad={props.preventJsLoad} />
				<title>{props.title}</title>
				{props.head}
			</head>
			<body evt-load={props.onLoad ?? ''}>{props.children}</body>
		</html>
	);
}

export function CtrPageBody(props: { children?: ReactNode }): ReactNode {
	return <div id="body">{props.children}</div>;
}
