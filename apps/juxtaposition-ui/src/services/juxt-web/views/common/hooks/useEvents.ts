export type EventProps = Record<`evt-${string}`, string>;

function isEntryEvent(entry: [string, any]): entry is [`evt-${string}`, string] {
	return entry[0].startsWith('evt-') && typeof entry[1] === 'string';
}

export function useEventProps<T extends Record<string, any>>(props: T): EventProps {
	return Object.fromEntries(
		Object.entries(props).filter(isEntryEvent)
	);
}
