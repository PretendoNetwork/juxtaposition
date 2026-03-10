import { useRequest } from '@/services/juxt-web/views/common/hooks/useRequest';
import type { ReactNode } from 'react';

function DefaultHead(): ReactNode {
	const req = useRequest();
	const addDebugJs = !req.userAgent.isConsole; // Only serve debug js to non-console browsers
	return (
		<>
			<link rel="stylesheet" type="text/css" href="/assets/portal/css/juxt.css" />
			{/* Debug allows non-console browsers to have some amount of the wiiu APIs. */}
			{addDebugJs ? <script src="/assets/portal/js/debug.global.js"></script> : null}
			<script src="/assets/portal/js/juxt.global.js"></script>
		</>
	);
}

export type HtmlProps = {
	children?: ReactNode;
	head?: ReactNode;
	title: string;
	onLoad?: string;
};

export function PortalRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead />
				<title>{props.title}</title>
				{props.head}
			</head>
			<body evt-load={props.onLoad ?? ''}>{props.children}</body>
		</html>
	);
}

export function PortalPageBody(props: { children?: ReactNode }): ReactNode {
	return <div id="body">{props.children}</div>;
}
