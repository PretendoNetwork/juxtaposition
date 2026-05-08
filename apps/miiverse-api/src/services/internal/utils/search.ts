import type { RootFilterQuery } from 'mongoose';

function escapeRegexString(str: string): string {
	// Everything not in this character set gets escaped
	return str.replace(/[^\w\d\s]/g, c => '\\' + c);
}

export function buildSearchQuery<TDoc>(fields: Array<keyof TDoc>, keyword: string): RootFilterQuery<TDoc> {
	const terms = keyword.trim().split(/\s+/).map(escapeRegexString);

	return {
		$or: fields.map(field => ({
			$and: terms.map(term => ({
				$expr: {
					$regexMatch: {
						input: { $toString: `$${String(field)}` },
						regex: term,
						options: 'i'
					}
				}
			}))
		}))
	};
}
