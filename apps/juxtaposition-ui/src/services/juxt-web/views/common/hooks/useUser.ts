import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';

export type UserPermissions = {
	moderator: boolean;
	developer: boolean;
};

export type UseUserValue = {
	pid: number; // TODO make this `null` when not logged in
	perms: UserPermissions;
};

export function useUser(): UseUserValue {
	const ctx = useRenderContext();
	return {
		pid: ctx.pid,
		perms: {
			moderator: ctx.moderator,
			developer: ctx.developer
		}
	};
}
