import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';
import type { ErrorViewProps } from '@/services/juxt-web/views/web/errorView';

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
