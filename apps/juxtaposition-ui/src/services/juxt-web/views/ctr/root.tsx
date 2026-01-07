import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type DefaultHeadProps = {
	ctx: RenderContext;
};

function DefaultHead(props: DefaultHeadProps): ReactNode {
	const addDebugJs = !props.ctx.uaIsConsole; // Only serve debug js to non-console browsers
	return (
		<>
			<link rel="stylesheet" type="text/css" href="/css/juxt.css" />
			{/* Debug allows non-console browsers to have some amount of the cave API. */}
			{addDebugJs ? <script src="/js/debug.global.js"></script> : null}
			<script src="/js/juxt.global.js"></script>
		</>
	);
}

export type HtmlProps = {
	ctx: RenderContext;
	children?: ReactNode;
	head?: ReactNode;
	title: string;
	onLoad?: string;
};

export function CtrRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead ctx={props.ctx} />
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
