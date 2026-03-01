import { Trans } from 'react-i18next';
import type { ReactNode } from 'react';

export type TranslationKey = Parameters<typeof Trans>[0]['i18nKey'];
export type TProps = {
	k: TranslationKey;
	values?: Record<string, number | string>;
	components?: Record<string | number, React.ReactElement>;
	withNewline?: boolean;
};

export function T(props: TProps): ReactNode {
	const components: TProps['components'] = {
		...props.components,
		...(props.withNewline ? { newline: <br /> } : undefined)
	};
	return <Trans i18n={props.k as any} values={props.values} components={components} />;
}
