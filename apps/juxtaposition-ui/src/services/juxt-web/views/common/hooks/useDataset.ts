export type DatasetProps = Record<`data-${string}`, string>;

function isEntryDataset(entry: [string, any]): entry is [`data-${string}`, string] {
	return entry[0].startsWith('data-') && typeof entry[1] === 'string';
}

export function useDatasetProps<T extends Record<string, any>>(props: T): DatasetProps {
	return Object.fromEntries(
		Object.entries(props).filter(isEntryDataset)
	);
}
