import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Response } from 'express';
import type { i18n } from 'i18next';

export type RenderContextContent = {
	i18n: i18n;
	cdnUrl: string;
	moderator: boolean;
	developer: boolean;
	pid: number;
	uaIsConsole?: boolean; // user agent looks like a Nintendo console
};

const InternalRenderContext = createContext<RenderContextContent | null>(null);

export function useRenderContext(): RenderContextContent {
	const data = useContext(InternalRenderContext);
	if (!data) {
		throw new Error('RenderContext has not been populated');
	}
	return data;
}

export function buildContext(res: Response): RenderContextContent {
	const locals = res.locals;
	return {
		cdnUrl: locals.cdnURL,
		moderator: locals.moderator,
		developer: locals.developer,
		uaIsConsole: locals.uaIsConsole,
		pid: locals.pid,
		i18n: res.i18n
	};
}

export function RenderContext(props: { children?: ReactNode; value: RenderContextContent }): ReactNode {
	return (
		<InternalRenderContext value={props.value}>
			{props.children}
		</InternalRenderContext>
	);
}
