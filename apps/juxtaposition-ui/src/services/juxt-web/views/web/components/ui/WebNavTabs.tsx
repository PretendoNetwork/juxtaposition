import type { ReactNode } from 'react';

/* TODO: actually implement NavTabs for web */

export type NavTabProps = {
	href: string;
	selected?: boolean;

	children: ReactNode[] | ReactNode;
};

export type NavTabsRowProps = {
	children: ReactNode[] | ReactNode;
};

export type NavTabsProps = {
	children: ReactNode[] | ReactNode;

	target: string; // Selector
};
