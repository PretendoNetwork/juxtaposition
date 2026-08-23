import { CtrIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrIcon';
import { CtrMiiIcon } from '@/services/juxt-web/views/ctr/components/ui/CtrMiiIcon';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { SystemPostViewProps } from '@/services/juxt-web/views/web/components/WebSystemPostView';

export function CtrSystemPostView(props: SystemPostViewProps): ReactNode {
	const { author, type } = props;

	// ""community""
	let community = <></>;
	if (type === 'community-comment') {
		community = <span className="community"><T k="community.description" /></span>;
	} else if (type === 'system') {
		community = <span className="community"><T k="global.system_message" /></span>;
	}

	return (
		<div className="post mascot">
			<div className="post-banner">
				{author
					? <CtrMiiIcon pid={author.pid} />
					: <CtrIcon src="/assets/ctr/images/bandwidthhappy-48.png" type="mii-icon" />}

				<div className="sprite sp-speech-bubble" />
				<div className="text">
					{author
						? <a className="screen-name" href={`/users/${author.pid}`} data-pjax="#body">{author.miiName}</a>
						: <span className="screen-name"><T k="global.mascot_name" /></span>}

					{community}
				</div>
			</div>

			<div className="post-body">
				<div className="post-content">
					<p className="post-content-text">{props.children}</p>
				</div>
			</div>
		</div>
	);
}
