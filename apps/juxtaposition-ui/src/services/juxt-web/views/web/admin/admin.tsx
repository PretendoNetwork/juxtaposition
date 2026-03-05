import cx from 'classnames';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import type { ReactNode } from 'react';

export type ModerationTabsProps = {
	selected: 'users' | 'reports' | 'communities';
};

export function WebModerationTabs(props: ModerationTabsProps): ReactNode {
	const user = useUser();

	return (
		<div className="buttons tabs">
			<a
				id="post-reports"
				className={cx({
					selected: props.selected === 'reports'
				})}
				href="/admin/posts"
			>
				Posts
			</a>
			<a
				id="account-reports"
				className={cx({
					selected: props.selected === 'users'
				})}
				href="/admin/accounts"
			>
				Accounts
			</a>
			{ user.perms.developer
				? (
						<a
							id="communities"
							className={cx({
								selected: props.selected === 'communities'
							})}
							href="/admin/communities"
						>
							Communities
						</a>
					)
				: null }
		</div>
	);
}
