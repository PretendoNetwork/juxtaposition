import cx from 'classnames';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import type { PostViewProps } from '@/services/juxt-web/views/web/post';

export function CtrPostRender(props: PostViewProps): ReactNode {
	const post = props.post;
	const cache = useCache();

	return (
		<div
			id={`post-${post.id}`}
		>
			<div className="post-header">
				<div className="speech-bubble">
					<span className="sprite sp-speech-bubble" />
				</div>
				<CtrMiiIcon type="poster-icon" pid={post.pid ?? 0} face_url={post.mii_face_url ?? undefined}></CtrMiiIcon>
				<div className="info">
					{/* make these links */}
					<div className="poster">{post.screen_name}</div>
					<div className="community">{cache.getCommunityName(post.community_id ?? '')}</div>
					{/* <!-- TODO topic tag ->> */}
				</div>
			</div>
			<div className="post-window">
				<div className="post-content">
					{post.body}
				</div>
				{/* painting TODO */}
				<div className="buttons">
					<div className="inner">
						<div className="yeah">&lt;3 123</div>
						<div className="reply">? 456</div>
						<div className="spacer"></div>
						<div className="timestamp">30m ago</div>
					</div>
				</div>
			</div>
		</div>
	);
}
