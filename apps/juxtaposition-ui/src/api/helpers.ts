export type AllFromListOptions = {
	limit: number;
};

export type PageControls = {
	limit: number;
	offset: number;
};

export type PagedResponse<T> = {
	items: Array<T>;
	total: number;
};

export async function getAllFromList<TResponse extends { data: PagedResponse<any> }, T = TResponse['data']['items'][number]>(cb: (page: PageControls) => Promise<TResponse>, options: AllFromListOptions): Promise<T[]> {
	const limit = options.limit;

	const items: T[] = [];
	let hasNextPage = true;
	let offset = 0;
	do {
		const { data } = await cb({ offset, limit });
		const page = data ?? { items: [], total: 0 }; // cb() is expected to throw on error, the fallback here should technically be unused

		items.push(...page.items);
		offset += limit;
		hasNextPage = offset + limit < page.total;
	} while (hasNextPage);

	return items;
}
