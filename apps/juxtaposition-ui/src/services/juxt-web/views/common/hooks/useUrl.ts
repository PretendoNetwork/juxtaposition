import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';
import type { Community } from '@/api/generated';

export type CtrHeader = { bannerUrl: string; imageId: string; legacy: boolean };
type Serializable = string | number | boolean | undefined | null;

function buildUrl(u: string, query?: Record<string, Serializable>): string {
	const [pathName, search = ''] = u.split('?', 2);
	const originalParams = new URLSearchParams(search);
	Object.entries(query ?? {}).forEach(([key, value]) => {
		if (value != null && value !== undefined) {
			originalParams.set(key, value.toString());
		}
	});
	return pathName + (originalParams.size > 0 ? '?' + originalParams.toString() : '');
}

function buildCdnUrl(cdnBaseUrl: string, path: string): string {
	const withSlash = path.startsWith('/') ? path : '/' + path;
	return cdnBaseUrl + withSlash;
}

function getCtrHeader(cdnBaseUrl: string, community: Community): CtrHeader {
	const imageId = community.parentId ? community.parentId : community.olive_community_id;
	const bannerUrl = buildCdnUrl(cdnBaseUrl, community.ctrHeaderImagePath);

	const legacy = community.hasLegacyCtrHeader;

	return { bannerUrl, imageId, legacy };
}

export type UseUrlValue = {
	ctrHeader: (com: Community) => CtrHeader;
	url: (u: string, query?: Record<string, Serializable>) => string;
	cdn: (path: string) => string;
	// TODO add util for building a mii image
};

export function useUrl(): UseUrlValue {
	const ctx = useRenderContext();

	return {
		ctrHeader: com => getCtrHeader(ctx.cdnUrl, com),
		url: buildUrl,
		cdn: path => buildCdnUrl(ctx.cdnUrl, path)
	};
}
