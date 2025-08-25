import type { RenderContext } from '@/services/juxt-web/views/context';

type Serializable = string | number | boolean | undefined | null;

function buildUrl(u: string, query?: Record<string, Serializable>): string {
	const [pathName, search = ''] = u.split('?', 2);
	const originalParams = new URLSearchParams(search);
	Object.entries(query ?? {}).forEach((entry) => {
		if (entry[1]) {
			originalParams.set(entry[0], entry[1].toString());
		}
	});
	return pathName + originalParams.toString();
}

function buildCdnUrl(ctx: RenderContext, path: string): string {
	const withSlash = path.startsWith('/') ? path : '/' + path;
	return ctx.cdnUrl + withSlash;
}

export const utils = {
	url: buildUrl,
	cdn: buildCdnUrl
};
