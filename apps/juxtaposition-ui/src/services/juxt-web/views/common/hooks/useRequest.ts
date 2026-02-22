import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';

export type UserAgentInfo = {
	isConsole: boolean;
};

export type UseRequestValue = {
	// TODO add request ID
	lang: string;
	userAgent: UserAgentInfo;
};

export function useRequest(): UseRequestValue {
	const ctx = useRenderContext();
	return {
		lang: ctx.lang,
		userAgent: {
			isConsole: ctx.uaIsConsole ?? false
		}
	};
}
