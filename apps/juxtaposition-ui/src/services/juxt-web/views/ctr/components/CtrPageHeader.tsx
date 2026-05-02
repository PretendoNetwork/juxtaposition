import cx from 'classnames';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { CtrHeader } from '@/services/juxt-web/views/common/hooks/useUrl';

export type CtrPageHeaderProps = DatasetProps & {
	type: 'icon-and-stats' | 'plain';
	header?: CtrHeader;

	children: ReactNode | ReactNode[];
};

export function CtrPageHeader(props: CtrPageHeaderProps): ReactNode {
	const dataset = useDatasetProps(props);
	return (
		<header
			style={{
				background: props.header ? `url('${props.header.bannerUrl}')` : ''
			}}
			className={cx('page-header', props.type, {
				'header-legacy': props.header?.legacy
			})}
			{...dataset}
		>
			<div className="title-area">
				{props.type === 'plain'
					? (
							<div className="title">
								<span>{props.children}</span>
							</div>
						)
					: props.children}

			</div>
		</header>
	);
}

export type CtrPageHeaderStatProps = {
	sprite: string;

	children: ReactNode | ReactNode[];
};

export function CtrPageHeaderStat(props: CtrPageHeaderStatProps): ReactNode {
	return (
		<div className="stat">
			<div className="icon">
				<div className={cx('sprite centred', props.sprite)}></div>
			</div>
			{props.children}
		</div>
	);
}
