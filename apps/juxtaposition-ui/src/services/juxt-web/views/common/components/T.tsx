import { Trans, useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';

export type TranslationKey = Parameters<typeof Trans>[0]['i18nKey'];
export type TProps = {
	k: TranslationKey;
	values?: Record<string, number | string>;
	components?: Record<string | number, React.ReactElement>;
	withNewline?: boolean;
};

export type TComponent = {
	(props: TProps): ReactNode;
	str(...args: Parameters<TFunction>): string;
};

export const T: TComponent = function T(props: TProps): ReactNode {
	const components: TProps['components'] = {
		...props.components,
		...(props.withNewline ? { newline: <br /> } : undefined)
	};
	return <Trans i18nKey={props.k as any} values={props.values} components={components} />;
} as any;

// Just importing `t` from `i18next` doesn't work, it needs to get it from the request, not global.
T.str = (...args): string => {
	const { t } = useTranslation();
	return t(...args);
};
