import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';

export type UseCacheValue = {
	/* Convert pid into a screen name */
	getUserName: (pid: number) => string | undefined;

	/* Convert title_id or olive_community_id to the community name */
	getCommunityName: (id: string) => string | undefined;
};

export function useCache(): UseCacheValue {
	const ctx = useRenderContext();
	return {
		getCommunityName: id => ctx.communityMap.get(id),
		getUserName: pid => ctx.usersMap.get(pid)
	};
}
