import cx from 'classnames';
import { useDatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { ReactNode } from 'react';
import type { DatasetProps } from '@/services/juxt-web/views/common/hooks/useDataset';
import type { CtrHeader } from '@/services/juxt-web/views/common/hooks/useUrl';

export type CtrPageHeaderProps = DatasetProps & {
	header?: CtrHeader;

	children: ReactNode | ReactNode[];
};

/**
 * CTR header with title text only. Provide text (or translation node) as child.
 *
 * @example
 * <CtrPageTitledHeader
 * 	data-toolbar-mode="normal"
 * 	data-toolbar-active-button="1"
 * >
 * 	<T k="setup.title" />
 * </CtrPageTitledHeader>
 */
export function CtrPageTitledHeader(props: CtrPageHeaderProps): ReactNode {
	const dataset = useDatasetProps(props);
	return (
		<header
			style={{
				background: props.header ? `url('${props.header.bannerUrl}')` : ''
			}}
			className={cx('page-header', 'plain', {
				'header-legacy': props.header?.legacy
			})}
			{...dataset}
		>
			<div className="title-area">
				{/* Double-stacked span for vertical align + line-clamp trickery */}
				<div className="title">
					<span>{props.children}</span>
				</div>
			</div>
		</header>
	);
}

/**
 * CTR header with icon, title and optional statistics.
 * Children must be arranged a specific way for layout to work.
 *
 * @example
 * <CtrPageIconHeader
 * 	header={header}
 * 	data-toolbar-mode="normal"
 * 	data-toolbar-active-button="1"
 * >
 * 	<!-- CtrCommunityIcon, CtrMiiIcon, CtrIcon acceptable -->
 * 	<CtrIcon src="image.png" type="header-icon" />
 * 	<div className="title">
 * 		<span>The extra span is needed for text wrapping to work</span>
 * 	</div>
 * 	<div className="stats">
 * 		<CtrPageHeaderStat sprite="sp-post-count">
 * 			<div>0</div>
 * 		</CtrPageHeaderStat>
 * 	</div>
 * </CtrPageIconHeader>
 */
export function CtrPageIconHeader(props: CtrPageHeaderProps): ReactNode {
	const dataset = useDatasetProps(props);
	return (
		<header
			style={{
				background: props.header ? `url('${props.header.bannerUrl}')` : ''
			}}
			className={cx('page-header', {
				'header-legacy': props.header?.legacy
			})}
			{...dataset}
		>
			<div className="title-area">
				{props.children}
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
