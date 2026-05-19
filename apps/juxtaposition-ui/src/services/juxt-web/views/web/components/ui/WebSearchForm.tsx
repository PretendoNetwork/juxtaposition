import { T } from '@/services/juxt-web/views/common/components/T';
import { WebUIIcon } from '@/services/juxt-web/views/web/components/ui/WebUIIcon';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';

export type SearchFormProps = DatasetProps & {
	type: 'box' | 'with-submit';
	search?: string;
};

export function WebSearchForm(props: SearchFormProps): ReactNode {
	const hideButton = props.type === 'with-submit' ? undefined : true;
	const dataset = useDatasetProps(props);
	return (
		<form className="search-form" method="get">
			<input type="string" name="search" className="searchbar" placeholder={T.str('global.search')} value={props.search} {...dataset} />
			<button type="submit" className="searchbar-button" disabled={hideButton} hidden={hideButton}>
				{/* TODO find a magnifying glass icon lol */}
				<WebUIIcon name="reply" />
			</button>
		</form>
	);
}
