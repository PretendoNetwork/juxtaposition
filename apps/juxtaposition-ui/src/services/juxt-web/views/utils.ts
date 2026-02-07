import type { InferSchemaType } from 'mongoose';
import type { CommunitySchema } from '@/models/communities';
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
	return pathName + (originalParams.size > 0 ? '?' + originalParams.toString() : '');
}

function buildCdnUrl(ctx: RenderContext, path: string): string {
	const withSlash = path.startsWith('/') ? path : '/' + path;
	return ctx.cdnUrl + withSlash;
}

function getCtrHeader(ctx: RenderContext, community: InferSchemaType<typeof CommunitySchema>):
{ bannerUrl: string; imageId: string; legacy: boolean } {
	const imageId = community.parent ? community.parent : community.olive_community_id;
	const bannerUrl = community.ctr_header
		? utils.cdn(ctx, community.ctr_header)
		: utils.cdn(ctx, `/headers/${imageId}/3DS.png`);

	const legacy = !community.ctr_header;

	return { bannerUrl, imageId, legacy };
}

export const utils = {
	url: buildUrl,
	cdn: buildCdnUrl,
	ctrHeader: getCtrHeader
};
