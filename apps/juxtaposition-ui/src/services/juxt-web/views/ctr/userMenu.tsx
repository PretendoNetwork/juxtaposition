import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type UserMenuViewProps = {
	ctx: RenderContext;
};

export function CtrUserMenuView(props: UserMenuViewProps): ReactNode {
	return (
		<CtrRoot ctx={props.ctx} title="Whoops!">
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title">User Menu</h1>
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<p>Howdy! We're not quite done here yet.</p>
					<p>Check back soon for updates!</p>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
