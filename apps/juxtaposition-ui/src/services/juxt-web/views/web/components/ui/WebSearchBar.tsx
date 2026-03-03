import { t } from 'i18next';
import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import type { ReactNode } from 'react';

export type WebSearchBarProps = {
	search?: string;
};

export function WebSearchBar(props: WebSearchBarProps): ReactNode {
	return (
		<form method="get">
			<input type="string" name="search" className="searchbar" placeholder={t('global.search')} value={props.search} />
			<button type="submit" className="searchbar-button">
				{/* TODO find a magnifying glass icon lol */}
				<WebUIIcon name="reply" />
			</button>
		</form>
	);
}
