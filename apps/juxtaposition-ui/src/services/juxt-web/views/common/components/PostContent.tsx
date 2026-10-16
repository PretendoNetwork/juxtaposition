import cx from 'classnames';
import { parseJuxtMarkdown } from '@repo/common';
import type { JuxtMdInlineNode, JuxtMdNode } from '@repo/common';
import type { ReactNode } from 'react';
import type { ShallowUser } from '@/api/generated';

export type PostContentComponentProps = {
	mention?: (text: string, pid: number) => ReactNode;
};

export type PostContentProps = {
	classNames?: {
		container?: string;
		plaintextContainer?: string;
		markdownContainer?: string;
	};
	components?: PostContentComponentProps;
	post: { body: string | null; bodyMarkdown: string | null; mentions: ShallowUser[] };
};

function renderInlineNodes(nodes: JuxtMdInlineNode[], components: PostContentComponentProps, userList: ShallowUser[]): ReactNode {
	return (
		<>
			{nodes.map((node) => {
				if (node.type === 'text') {
					return node.value;
				}
				if (node.type === 'br') {
					return <br />;
				}
				if (node.type === 'code') {
					return <code className="prose-code">{node.value}</code>;
				}
				if (node.type === 'mention') {
					const user = userList.find(v => v.pid === node.pid);
					const text = user?.pnid ?? user?.miiName ?? node.pid.toString();
					return components.mention?.(text, node.pid) ?? <span>@{text}</span>;
				}

				if (node.type === 'bold') {
					return <b className="prose-bold">{renderInlineNodes(node.children, components, userList)}</b>;
				}
				if (node.type === 'italic') {
					return <em className="prose-italic">{renderInlineNodes(node.children, components, userList)}</em>;
				}
				if (node.type === 'strikethrough') {
					return <s className="prose-strikethrough">{renderInlineNodes(node.children, components, userList)}</s>;
				}

				return '';
			})}
		</>
	);
}

function renderNode(node: JuxtMdNode, components: PostContentComponentProps, userList: ShallowUser[]): ReactNode {
	if (node.type === 'paragraph') {
		return <p className="prose-par">{renderInlineNodes(node.children, components, userList)}</p>;
	}
}

export function PostMarkdown(props: { className?: string; content: string; components: PostContentComponentProps; mentions: ShallowUser[] }): ReactNode {
	const nodes = parseJuxtMarkdown(props.content);

	return (
		<div className={props.className}>
			{nodes.map(node => <>{renderNode(node, props.components, props.mentions)}</>)}
		</div>
	);
}

export function PostContent(props: PostContentProps): ReactNode {
	if (props.post.bodyMarkdown) {
		return (
			<PostMarkdown
				className={cx(props.classNames?.container, props.classNames?.markdownContainer)}
				content={props.post.bodyMarkdown}
				mentions={props.post.mentions}
				components={props.components ?? {}}
			/>
		);
	}

	if (props.post.body) {
		return (
			<div className={cx(props.classNames?.container, props.classNames?.plaintextContainer)}>
				<p>{props.post.body}</p>
			</div>
		);
	}

	return null;
}
