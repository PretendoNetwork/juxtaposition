import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebReportModalView } from '@/services/juxt-web/views/web/reportModalView';
import { utils } from '@/services/juxt-web/views/utils';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import type { ReactNode } from 'react';
import type { InferSchemaType } from 'mongoose';
import type { GetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ContentSchema } from '@/models/content';
import type { CommunitySchema } from '@/models/communities';
import type { PostDto } from '@/api/post';

export type PostPageViewProps = {
	ctx: RenderContext;
	post: PostDto;
	userContent: InferSchemaType<typeof ContentSchema>;
	postPNID: GetUserDataResponse;
	community: InferSchemaType<typeof CommunitySchema>;
	replies: PostDto[];
	canPost: boolean;
};

function PostHead(props: PostPageViewProps): ReactNode {
	const post = props.post;
	const pageTitle = `Post by ${post.screen_name}`;

	if (post.removed) {
		return (
			<title>{pageTitle}</title>
		);
	}

	const title = `${post.screen_name} (@${props.postPNID.username}) - ${props.community.name}`;
	const description = post.body + '\n\n' +
		`${post.reply_count} 🗨️  ${post.empathy_count} ❤️`;
	let image: string | null = null;
	if (post.screenshot) {
		image = utils.cdn(props.ctx, post.screenshot);
	} else if (post.painting) {
		image = utils.cdn(props.ctx, `/paintings/${post.pid}/${post.id}.png`);
	}

	return (
		<>
			<title>{pageTitle}</title>

			{/* Google / Search Engine Tags */}
			<meta itemProp="name" content={title} />
			<meta itemProp="description" content={description} />
			{image ? <meta itemProp="image" content={image} /> : null}

			{/* Open Graph Meta Tags */}
			<meta property="og:type" content="article" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={`https://juxt.pretendo.cc/posts/${post.id}`} />
			<meta property="og:image" content={image ?? 'https://pretendo.network/assets/images/opengraph/opengraph-image.png'} />
			<meta property="og:site_name" content="Juxtaposition - Pretendo Network" />

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:site" content="@PretendoNetwork" />
			{image ? <meta name="twitter:image" content={image} /> : null }
			<meta name="twitter:creator" content="@PretendoNetwork" />
		</>
	);
}

export function WebPostPageView(props: PostPageViewProps): ReactNode {
	return (
		<WebRoot head={<PostHead {...props} />}>
			<h2 id="title" className="page-header">Post</h2>
			<WebNavBar ctx={props.ctx} selection={2} />
			<div id="toast"></div>
			<div className="community-page-post-box" id="post">
				<WebWrapper>
					<WebPostView ctx={props.ctx} post={props.post} isMainPost />
					<span className="replies-line" />
					{props.replies.map(replyPost => (
						<div key={replyPost.id}>
							<WebPostView ctx={props.ctx} post={replyPost} isReply />
							<span className="replies-line" />
						</div>
					))}
				</WebWrapper>
			</div>
			<WebReportModalView ctx={props.ctx} />
		</WebRoot>
	);
}
