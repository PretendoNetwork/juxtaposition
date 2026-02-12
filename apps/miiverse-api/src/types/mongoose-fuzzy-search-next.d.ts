declare module 'mongoose-fuzzy-search-next' {
	export function FuzzySearch(fields: string[], keyword: string): { $or: any[] };
}
