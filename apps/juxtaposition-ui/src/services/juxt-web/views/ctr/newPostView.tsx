import cx from 'classnames';
import { utils } from '@/services/juxt-web/views/utils';
import { CtrTabsView, CtrTabView } from '@/services/juxt-web/views/ctr/ctabs';
import { CtrCheckbox } from '@/services/juxt-web/views/ctr/checkbox';
import type { ReactNode } from 'react';
import type { NewPostViewProps } from '@/services/juxt-web/views/web/newPostView';

const empathies = [
	{
		value: 0,
		className: 'sprite sp-feeling-normal',
		isDefault: true
	},
	{
		value: 1,
		className: 'sprite sp-feeling-happy'
	},
	{
		value: 2,
		className: 'sprite sp-feeling-like'
	},
	{
		value: 3,
		className: 'sprite sp-feeling-surprise'
	},
	{
		value: 4,
		className: 'sprite sp-feeling-frustrated'
	},
	{
		value: 5,
		className: 'sprite sp-feeling-puzzled'
	}
];

export function CtrNewPostView(props: NewPostViewProps): ReactNode {
	const { ctrBanner, ctrLegacy } = props;
	return (
		<div id="add-post-page" className="add-post-page official-user-post">
			<header
				id="header"
				style={{
					background: ctrBanner ? `url('${ctrBanner}')` : ''
				}}
				className={cx(
					{ 'header-legacy': ctrLegacy }
				)}
			>
				<h1 id="page-title">
					{props.ctx.lang.new_post.post_to}
					{' '}
					{props.name}
				</h1>
			</header>
			<form method="post" action={props.url} id="posts-form" data-is-own-title="1" data-is-identified="1" encType="multipart/form-data">
				<input type="hidden" name="community_id" value={props.id} />
				<input type="hidden" name="bmp" value="true" />
				<div className="add-post-page-content">
					<div className="feeling-selector expression">
						<img src={utils.cdn(props.ctx, `/mii/${props.ctx.pid}/normal_face.png`)} className="icon" />
						<menu className="buttons">
							{empathies.map(v => (
								<input
									key={v.value}
									type="radio"
									name="feeling_id"
									value={v.value}
									className={v.className}
									defaultChecked={v.isDefault}
								/>
							))}
						</menu>
					</div>
					<CtrTabsView>
						<CtrTabView name="_post_type" value="body" sprite="sp-text-input" default>
							<textarea
								name="body"
								id="body-text-input"
								value=""
								maxLength={280}
								placeholder="Share your thoughts in a post to a community or to your followers."
							/>
						</CtrTabView>
						<CtrTabView name="_post_type" value="shot" sprite="sp-shot-input">
							<div id="shot-preview" data-shot-preview="1"></div>

							<div className="shot-picker">
								<input type="radio" name="shot-type" className="shot top" data-shot="1" data-lls="shot-top"></input>
								<input type="radio" name="shot-type" className="shot btm" data-shot="0" data-lls="shot-btm"></input>
								<div id="shot-clear">
									<div className="sprite sp-clear centred"></div>
									<input type="radio" name="shot-type" data-shot-clear="1"></input>
								</div>
							</div>

							<input
								type="file"
								name="shot"
								data-shot-upload="1"
								data-shot-mode={props.shotMode}
								data-shot-tids={props.shotTids}
								disabled
							>
							</input>
						</CtrTabView>
						<CtrTabView name="_post_type" value="painting" sprite="sp-memo-input">
							<img id="memo-img-input" src="" />
							<input type="hidden" name="painting" />
						</CtrTabView>
						<div className="spoiler-checkbox">
							<label htmlFor="cb-spoiler">Spoiler</label>
							<CtrCheckbox id="cb-spoiler" name="spoiler" value="true" sprite="sp-spoiler" />
						</div>
					</CtrTabsView>
				</div>
				<input id="message_to_pid" type="hidden" name="message_to_pid" value={props.messagePid ?? undefined} />
				<input
					id="close-modal-button"
					type="button"
					className="olv-modal-close-button fixed-bottom-button left"
					value="Cancel"
					data-module-show={props.show}
					data-module-hide="add-post-page"
					data-header="true"
				/>
				<input
					type="submit"
					id="submit"
					className="post-button fixed-bottom-button"
					value="Post"
					evt-click="wiiuBrowser.lockUserOperation(true);"
				/>
			</form>
		</div>
	);
}
