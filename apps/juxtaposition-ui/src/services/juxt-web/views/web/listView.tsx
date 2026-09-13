import { buildUrl } from '@/services/juxt-web/views/common/hooks/useUrl';

export type ListViewLinks = {
	nextLink: string;
	prevPageLink: string | null;
	nextPageLink: string;
};

/**
 * Helper function to populate the Link fields for list views
 */
export function buildListLinks(baseUrl: string, offset: number, length: number): ListViewLinks {
	return {
		nextLink: buildUrl(baseUrl, {
			offset: offset + length,
			pjax: 'true'
		}),
		prevPageLink: offset > 0
			? buildUrl(baseUrl, {
					offset: Math.max(offset - length, 0)
				})
			: null,
		nextPageLink: buildUrl(baseUrl, {
			offset: offset + length
		})
	};
}

export type ListViewRemaining = {
	remaining: number;
};

export function buildListRemaining(offset: number, length: number, total: number): ListViewRemaining {
	return {
		remaining: Math.max(total - offset - length, 0)
	};
}
