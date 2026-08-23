import { T } from '@/services/juxt-web/views/common/components/T';
import { PortalMiiIcon } from '@/services/juxt-web/views/portal/components/ui/PortalMiiIcon';
import { PortalIcon } from '@/services/juxt-web/views/portal/components/ui/PortalIcon';
import type { ReactNode } from 'react';
import type { SystemPostViewProps } from '@/services/juxt-web/views/web/components/WebSystemPostView';

export function PortalSystemPostView(props: SystemPostViewProps): ReactNode {
	const { author, type } = props;

	// ""community""
	let community = null;
	if (type === 'community-comment') {
		community = <span className="community-name"><T k="community.description" /></span>;
	} else if (type === 'system') {
		community = <span className="community-name"><T k="global.system_message" /></span>;
	}

	const content = (
		<>
			{author
				? <PortalMiiIcon pid={author.pid} />
				: <PortalIcon src="/assets/portal/images/bandwidthhappy-96.png" type="mii-icon" />}
			<div className="post-body-content">
				<div className="post-body">
					<header>
						<span className="screen-name">
							{author ? author.miiName : <T k="global.mascot_name" />}
						</span>
					</header>

					{community
						? (
								<div className="community-banner" data-pjax="#body">
									<span className="title-icon-container" data-pjax="#body">
										<img src="/assets/portal/images/pretendo-logo-48.png" className="title-icon" />
									</span>
									{community}
								</div>
							)
						: null}

					<div className="post-content">
						<p className="post-content-text">{props.children}</p>
					</div>

				</div>
			</div>
		</>
	);

	return (
		<div className="post">
			{content}
		</div>
	);
}
