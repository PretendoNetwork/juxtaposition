import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';
import type { InferSchemaType } from 'mongoose';
import type { CommunitySchema } from '@/models/communities';

export type CtrHeader = { bannerUrl: string; imageId: string; legacy: boolean };
type Serializable = string | number | boolean | undefined | null;

function buildUrl(u: string, query?: Record<string, Serializable>): string {
	const [pathName, search = ''] = u.split('?', 2);
	const originalParams = new URLSearchParams(search);
	Object.entries(query ?? {}).forEach((entry) => {
		if (entry[1]) {
			originalParams.set(entry[0], entry[1].toString());
		}
	});
	return pathName + (originalParams.size > 0 ? '?' + originalParams.toString() : '');
}

function buildCdnUrl(cdnBaseUrl: string, path: string): string {
	const withSlash = path.startsWith('/') ? path : '/' + path;
	return cdnBaseUrl + withSlash;
}

function getCtrHeader(cdnBaseUrl: string, community: InferSchemaType<typeof CommunitySchema>): CtrHeader {
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const bannerUrl = community.ctr_header
		? buildCdnUrl(cdnBaseUrl, community.ctr_header)
		: buildCdnUrl(cdnBaseUrl, `/headers/${imageId}/3DS.png`);

	const legacy = !community.ctr_header;

	return { bannerUrl, imageId, legacy };
}

export type UseUrlValue = {
	ctrHeader: (com: InferSchemaType<typeof CommunitySchema>) => CtrHeader;
	url: (u: string, query?: Record<string, Serializable>) => string;
	cdn: (path: string) => string;
};

export function useUrl(): UseUrlValue {
	const ctx = useRenderContext();

	return {
		ctrHeader: com => getCtrHeader(ctx.cdnUrl, com),
		url: buildUrl,
		cdn: path => buildCdnUrl(ctx.cdnUrl, path)
	};
}
