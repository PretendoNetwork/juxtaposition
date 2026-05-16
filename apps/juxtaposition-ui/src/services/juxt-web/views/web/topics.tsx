import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';

export type TopicTagViewProps = {
	title: string;
	children: ReactNode | ReactNode[];
};

export function WebTopicTagView(props: TopicTagViewProps): ReactNode {
	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="global.activity_feed" />
			</h2>
			<WebNavBar selection={1} />
			<div id="toast"></div>
			<WebWrapper>
				{props.children}
			</WebWrapper>
			<WebReportModalView />
		</WebRoot>
	);
}
