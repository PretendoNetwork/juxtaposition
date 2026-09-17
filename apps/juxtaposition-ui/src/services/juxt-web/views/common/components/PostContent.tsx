import cx from 'classnames';
import type { ReactNode } from 'react';

export type PostContentProps = {
	classNames?: {
		container?: string;
		plaintextContainer?: string;
		markdownContainer?: string;
	};
	post: { body: string | null; bodyMarkdown: string | null };
};

export function PostMarkdown(props: { className?: string; content: string }): ReactNode {
	return (
		<div className={props.className}>
			<p>{props.content}</p>
		</div>
	);
}

export function PostContent(props: PostContentProps): ReactNode {
	// TODO disabled until markdown rendering works
	// if (props.post.bodyMarkdown) {
	// 	return <PostMarkdown className={cx(props.classNames?.container, props.classNames?.markdownContainer)} content={props.post.bodyMarkdown} />;
	// }

	if (props.post.body) {
		return (
			<div className={cx(props.classNames?.container, props.classNames?.plaintextContainer)}>
				<p>{props.post.body}</p>
			</div>
		);
	}

	return null;
}
