import { CtrPageHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';

export type UserMenuViewProps = {
};

export function CtrUserMenuView(_props: UserMenuViewProps): ReactNode {
	return (
		<CtrRoot
			title="Whoops!"
		>
			<CtrPageBody>
				<CtrPageHeader
					type="plain"

					data-toolbar-mode="normal"
					data-toolbar-active-button="5"
				>
					User Menu
				</CtrPageHeader>
				<div className="body-content tab2-content" id="community-post-list">
					<p>Howdy! We're not quite done here yet.</p>
					<p>Check back soon for updates!</p>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
