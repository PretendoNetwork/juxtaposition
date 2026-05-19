import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { SearchFormProps } from '@/services/juxt-web/views/web/components/ui/WebSearchForm';

export function CtrSearchForm(props: SearchFormProps): ReactNode {
	const dataset = useDatasetProps(props);
	return (
		<form className="search-form">
			{/* Prevent implicit form submission */}
			<button type="submit" disabled aria-hidden="true"></button>
			<input type="string" name="search" placeholder={T.str('global.search')} {...dataset} />
		</form>
	);
}
