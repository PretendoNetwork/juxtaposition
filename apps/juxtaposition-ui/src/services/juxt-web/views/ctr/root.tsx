import type { ReactNode } from 'react';

export type DefaultHeadProps = {
	preventJsLoad?: boolean;
};

function DefaultHead(props: DefaultHeadProps): ReactNode {
	const loadJs = !props.preventJsLoad;
	const addDebugJs = !props.ctx.uaIsConsole; // Only serve debug js to non-console browsers
	return (
		<>
			<link rel="stylesheet" type="text/css" href="/css/juxt.css" />
			{/* Debug allows non-console browsers to have some amount of the cave API. */}
			{addDebugJs ? <script src="/js/debug.global.js"></script> : null}
			{/* Non-console browsers probably want this too. */}
			{addDebugJs ? <meta name="viewport" content="width=device-width, initial-scale=1.0" /> : null}
			{loadJs ? <script src="/js/juxt.global.js"></script> : null}
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
