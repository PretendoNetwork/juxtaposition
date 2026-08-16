import type { RootFilterQuery } from 'mongoose';

function escapeRegexString(str: string): string {
	// Everything not in this character set gets escaped
	return str.replace(/[^\w\d\s]/g, c => '\\' + c);
}

function extractSearchKeywords(keyword: string): string[] {
	return keyword.trim().split(/\s+/);
}

export function buildSearchQuery<TDoc>(fields: Array<keyof TDoc>, keyword: string): RootFilterQuery<TDoc> {
	const terms = extractSearchKeywords(keyword).map(escapeRegexString);

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

type Expand<T> = {
	[K in keyof T]: T[K];
};
type PrismaCaseInsensitiveStringContains = {
	contains: string;
	mode: 'insensitive';
};
type PrismaSearchQuery<TFields extends string[]> = Expand<{
	OR: Array<{
		AND: Array<{
			[K in TFields[any]]?: PrismaCaseInsensitiveStringContains
		}>;
	}>;
}>;

export function buildPrismaSearchQuery<const TFields extends string[]>(fields: TFields, keyword: string): PrismaSearchQuery<TFields> {
	const terms = extractSearchKeywords(keyword);
	const result: PrismaSearchQuery<string[]> = {
		OR: fields.map(field => ({
			AND: terms.map(term => ({
				[field]: {
					contains: term,
					mode: 'insensitive'
				}
			}))
		}))
	};
	return result as PrismaSearchQuery<TFields>;
}
