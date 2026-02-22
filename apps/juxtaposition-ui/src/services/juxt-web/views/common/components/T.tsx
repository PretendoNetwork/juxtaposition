import { t } from 'i18next';
import type { ReactNode } from 'react';
import type { Trans } from 'react-i18next';

export type TranslationKey = Parameters<typeof Trans>[0]['i18nKey'];
export function T(props: { k: TranslationKey }): ReactNode {
	return t(props.k as any);
}
