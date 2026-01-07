import { DefaultHead } from '@/services/juxt-web/views/web/root';
import type { ReactNode } from 'react';
import type { HtmlProps } from '@/services/juxt-web/views/web/root';

export function LoginHead(): ReactNode {
	return (
		<>
			{/* windows/ios/chrome */}
			<meta http-equiv="X-UA-Compatible" content="ie=edge" />
			<meta name="apple-mobile-web-app-title" content="Juxtaposition" />
			<meta name="application-name" content="Juxtaposition" />
			<meta name="msapplication-TileColor" content="#1b1f3b" />
			<meta name="theme-color" content="#1b1f3b" />

			{/* open graph/embeds */}
			<meta property="og:title" content="Juxtaposition" />
			<meta property="og:description" content="An open source Nintendo Network replacement that aims to build custom servers for the WiiU and 3DS family of consoles" />
			<meta property="og:type" content="website" />
			<meta property="og:url" content="https://juxt.pretendo.network/" />
			<meta property="og:image" content="https://pretendo.network/assets/images/opengraph/opengraph-image.png" />
			<meta property="og:image:alt" content="Juxtaposition" />
			<meta property="og:site_name" content="Juxtaposition" />

			{/* twitter embeds */}
			<meta name="twitter:url" content="https://juxt.pretendo.network/" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@PretendoNetwork" />
			<meta name="twitter:title" content="Pretendo Network" />
			<meta name="twitter:description" content="An open source Nintendo Network replacement that aims to build custom servers for the WiiU and 3DS family of consoles" />
			<meta name="twitter:image" content="https://pretendo.network/assets/images/opengraph/opengraph-image.png" />

			{/* google seo */}
			<meta name="description" content="An open source Nintendo Network replacement that aims to build custom servers for the WiiU and 3DS family of consoles" />
			<meta name="robots" content="index, follow" />

			{/* favicon */}
			<link rel="apple-touch-icon" href="/web/icons/icon-144x144.png" />
			<link rel="icon" type="image/png" href="/web/icons/icon-144x144.png" />
			<link rel="shortcut icon" href="/web/icons/icon-72x72.png" />

			<link rel="stylesheet" href="/css/login.css" />
			<script src="/js/login.global.js" />
		</>
	);
}

export function WebLoginRoot(props: HtmlProps): ReactNode {
	return (
		<html lang="en">
			<head>
				<DefaultHead />
				<LoginHead />
				{props.head}
			</head>
			<body>
				<div className="main-body">
					{props.children}
				</div>
			</body>
		</html>
	);
}
