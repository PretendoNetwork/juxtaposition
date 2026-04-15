import type { RootFilterQuery } from 'mongoose';

export function buildSearchQuery<TDoc>(fields: Array<keyof TDoc>, keyword: string): RootFilterQuery<TDoc> {
	const terms = keyword.trim().split(/\s+/);

	return {
		$or: fields.map(field => ({
			$and: terms.map(term => ({
				[field]: { $regex: term, $options: 'i' }
			}))
		}))
	};
}
