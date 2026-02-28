import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import type { ReactNode } from 'react';
import type { RenderContext } from '@/services/juxt-web/views/context';

export type WebSearchBarProps = {
	ctx: RenderContext;

	search?: string;
};

export function WebSearchBar(props: WebSearchBarProps): ReactNode {
	return (
		<form method="get">
			<input type="string" name="search" className="searchbar" placeholder="Search..." value={props.search} />
			<button type="submit" className="searchbar-button">
				{/* TODO find a magnifying glass icon lol */}
				<WebUIIcon name="reply" />
			</button>
		</form>
	);
}
