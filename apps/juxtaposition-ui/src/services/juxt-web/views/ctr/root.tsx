import type { ReactNode } from 'react';

function DefaultHead(): ReactNode {
	return (
		<>
			<link rel="stylesheet" type="text/css" href="/css/juxt.css" />
			<script src="/js/debug.js"></script>
			<script src="/js/pjax.js"></script>
			<script src="/js/juxt.js"></script>
		</>
	);
}

export type HtmlProps = {
	children?: ReactNode;
	head?: ReactNode;
	title: string;
};

export function CtrRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead />
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
