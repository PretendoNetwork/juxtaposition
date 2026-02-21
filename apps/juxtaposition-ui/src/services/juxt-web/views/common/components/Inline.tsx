import type { ReactNode } from 'react';

export const Inline = {
	Script(props: { src: string }): ReactNode {
		return <script dangerouslySetInnerHTML={{ __html: props.src }} />;
	},
	Style(props: { src: string }): ReactNode {
		return <style dangerouslySetInnerHTML={{ __html: props.src }} />;
	}
};
