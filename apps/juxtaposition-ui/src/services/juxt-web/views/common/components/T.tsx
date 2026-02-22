import { t } from 'i18next';
import type { ReactNode } from 'react';

export type TranslationKey = Parameters<typeof t>[0];
export function T(props: { k: TranslationKey }): ReactNode {
	return t(props.k as any);
}
