import { I18nextProvider } from 'react-i18next';
import { useRequest } from '@/services/juxt-web/views/common/hooks/useRequest';
import { createI18n } from '@/i18n';
import type { ReactNode } from 'react';

export function LangProvider(props: { children?: ReactNode }): ReactNode {
	const req = useRequest();
	return <I18nextProvider i18n={createI18n(req.lang)}>{props.children}</I18nextProvider>;
}
