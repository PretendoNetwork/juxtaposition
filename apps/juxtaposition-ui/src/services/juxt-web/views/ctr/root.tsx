import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ReactNode } from 'react';

export type DefaultHeadProps = {
	ctx: RenderContext;
};

function DefaultHead(props: DefaultHeadProps): ReactNode {
	return (
		<>
			<link rel="stylesheet" type="text/css" href="/css/juxt.css" />
			{/* Debug allows non-console browsers to have some amount of the cave API. */}
			{props.ctx.uaIsConsole ?? true ? <></> : <script src="/js/debug.global.js"></script>}
			<script src="/js/juxt.global.js"></script>
		</>
	);
}

export type HtmlProps = {
	ctx: RenderContext;
	children?: ReactNode;
	head?: ReactNode;
	title: string;
};

export function CtrRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead ctx={props.ctx} />
				<title>{props.title}</title>
				{props.head}
			</head>
			<body>{props.children}</body>
		</html>
	);
}

export function CtrPageBody(props: { children?: ReactNode }): ReactNode {
	return <div id="body">{props.children}</div>;
}
