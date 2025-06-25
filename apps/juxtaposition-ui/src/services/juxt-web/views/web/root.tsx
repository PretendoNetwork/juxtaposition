import { InlineScript } from '@/services/juxt-web/views/common';
import type { ReactNode } from 'react';

function DefaultHead(): ReactNode {
	return (
		<>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link rel="stylesheet" type="text/css" href="/css/web.css" />
			<script src="/js/web.global.js" />
			<link rel="manifest" href="/web/manifest.json" />
			<link
				href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap"
				rel="stylesheet"
			/>
			{/* Global site tag (gtag.js) - Google Analytics Testing */}
			<script
				async
				src="https://www.googletagmanager.com/gtag/js?id=UA-195842548-1"
			/>
			<InlineScript
				src={`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'UA-195842548-1');
				`}
			/>
		</>
	);
}

export type HtmlProps = {
	children?: ReactNode;
	head?: ReactNode;
};

export function WebRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead />
				{props.head}
			</head>
			<body>
				<div id="main">{props.children}</div>
			</body>
		</html>
	);
}
