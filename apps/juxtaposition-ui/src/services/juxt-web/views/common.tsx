import type { ReactNode } from 'react';

export function InlineScript(props: { src: string }): ReactNode {
	return <script dangerouslySetInnerHTML={{ __html: props.src }} />;
}

export function InlineStyle(props: { src: string }): ReactNode {
	return <style dangerouslySetInnerHTML={{ __html: props.src }} />;
}

export function findDataset(props: any): Record<`data-${string}`, string> {
	return Object.fromEntries(
		Object.entries(props).filter(
			([key, val]) => key.startsWith('data-') && typeof val === 'string'
		)
	) as Record<`data-${string}`, string>;
}
