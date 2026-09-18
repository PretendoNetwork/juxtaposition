import cx from 'classnames';
import { parseJuxtMarkdown } from '@repo/common';
import type { JuxtMdInlineNode, JuxtMdNode } from '@repo/common';
import type { ReactNode } from 'react';
import type { ShallowUser } from '@/api/generated';

export type PostContentProps = {
	classNames?: {
		container?: string;
		plaintextContainer?: string;
		markdownContainer?: string;
	};
	post: { body: string | null; bodyMarkdown: string | null; mentions: ShallowUser[] };
};

function renderInlineNodes(nodes: JuxtMdInlineNode[], userList: ShallowUser[]): ReactNode {
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
					return <code className="prose-code prose-mention">@{user?.pnid ?? user?.miiName ?? node.pid}</code>;
				}

				if (node.type === 'bold') {
					return <b className="prose-bold">{renderInlineNodes(node.children, userList)}</b>;
				}
				if (node.type === 'italic') {
					return <em className="prose-italic">{renderInlineNodes(node.children, userList)}</em>;
				}
				if (node.type === 'strikethrough') {
					return <s className="prose-strikethrough">{renderInlineNodes(node.children, userList)}</s>;
				}

				return '';
			})}
		</>
	);
}

function renderNode(node: JuxtMdNode, userList: ShallowUser[]): ReactNode {
	if (node.type === 'paragraph') {
		return <p className="prose-par">{renderInlineNodes(node.children, userList)}</p>;
	}
}

export function PostMarkdown(props: { className?: string; content: string; mentions: ShallowUser[] }): ReactNode {
	const nodes = parseJuxtMarkdown(props.content);

	return (
		<div className={props.className}>
			{nodes.map(node => <>{renderNode(node, props.mentions)}</>)}
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
