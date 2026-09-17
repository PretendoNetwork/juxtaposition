import cx from 'classnames';
import { parseJuxtMarkdown } from '@repo/common';
import type { JuxtMdInlineNode, JuxtMdNode } from '@repo/common';
import type { ReactNode } from 'react';

export type PostContentProps = {
	classNames?: {
		container?: string;
		plaintextContainer?: string;
		markdownContainer?: string;
	};
	post: { body: string | null; bodyMarkdown: string | null };
};

function renderInlineNodes(nodes: JuxtMdInlineNode[]): ReactNode {
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
					return <pre className="prose-code">{node.value}</pre>;
				}

				if (node.type === 'bold') {
					return <b className="prose-bold">{renderInlineNodes(node.children)}</b>;
				}
				if (node.type === 'italic') {
					return <em className="prose-italic">{renderInlineNodes(node.children)}</em>;
				}
				if (node.type === 'strikethrough') {
					return <s className="prose-strikethrough">{renderInlineNodes(node.children)}</s>;
				}

				return '';
			})}
		</>
	);
}

function renderNode(node: JuxtMdNode): ReactNode {
	if (node.type === 'paragraph') {
		return <p className="prose-par">{renderInlineNodes(node.children)}</p>;
	}
}

export function PostMarkdown(props: { className?: string; content: string }): ReactNode {
	const nodes = parseJuxtMarkdown(props.content);

	return (
		<div className={props.className}>
			{nodes.map(node => <>{renderNode(node)}</>)}
		</div>
	);
}

export function PostContent(props: PostContentProps): ReactNode {
	if (props.post.bodyMarkdown) {
		return <PostMarkdown className={cx(props.classNames?.container, props.classNames?.markdownContainer)} content={props.post.bodyMarkdown} />;
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
