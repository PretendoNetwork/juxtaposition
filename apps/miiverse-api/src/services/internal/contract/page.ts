/* !!! HEY
 * This type has a copy in apps/juxtaposition-ui/src/api/page.ts
 * Make sure to copy over any modifications! */

export type PageDto<T> = {
	items: T[];
};

export function mapPages<T>(items: T[]): PageDto<T> {
	return {
		items
	};
}
