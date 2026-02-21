import cx from 'classnames';
import type { ReactNode } from 'react';

export type ModerationTabsProps = {
	selected: 'users' | 'reports' | 'communities';
};

export function WebModerationTabs(props: ModerationTabsProps): ReactNode {
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
			{ props.ctx.developer
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
