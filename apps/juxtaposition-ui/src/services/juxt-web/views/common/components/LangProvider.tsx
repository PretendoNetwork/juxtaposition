import { I18nextProvider } from 'react-i18next';
import { useRenderContext } from '@/services/juxt-web/views/common/components/RenderContext';
import type { ReactNode } from 'react';

export function LangProvider(props: { children?: ReactNode }): ReactNode {
	const ctx = useRenderContext();
	return <I18nextProvider i18n={ctx.i18n}>{props.children}</I18nextProvider>;
}
