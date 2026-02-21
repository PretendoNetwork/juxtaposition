import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';

export type UserAgentInfo = {
	isConsole: boolean;
};

export type UseRequestValue = {
	// TODO add request ID
	userAgent: UserAgentInfo;
};

export function useRequest(): UseRequestValue {
	const ctx = useRenderContext();
	return {
		userAgent: {
			isConsole: ctx.uaIsConsole ?? false
		}
	};
}
