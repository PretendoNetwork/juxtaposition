import { CtrTabsView, CtrTabView } from '@/services/juxt-web/views/ctr/controls/ctabs';
import { CtrCheckbox } from '@/services/juxt-web/views/ctr/controls/checkbox';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { CtrPageHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
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
	const url = useUrl();
	const user = useUser();
	const cache = useCache();
	const header = props.community ? url.ctrHeader(props.community) : undefined;
	const name = props.name ?? cache.getUserName(props.pid ?? 0);
	return (
		<div id="add-post-page" className="add-post-page official-user-post">
			<CtrPageHeader
				type="plain"
				header={header}
				data-toolbar-mode="wide"
				data-toolbar-message={T.str('new_post.post_to', { user: name })}
			>
				<T k="new_post.post_to" values={{ user: name ?? '' }} />
			</CtrPageHeader>
			<form method="post" action={props.url} id="posts-form" data-is-own-title="1" data-is-identified="1" encType="multipart/form-data">
				<input type="hidden" name="community_id" value={props.id} />
				<input type="hidden" name="bmp" value="true" />
				<div className="add-post-page-content">
					<div className="feeling-selector expression">
						<img src={url.cdn(`/mii/${user.pid}/normal_face.png`)} className="icon" />
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
								placeholder={T.str('new_post.content_placeholder')}
							/>
						</CtrTabView>
						{props.shotMode !== 'block'
							? (
									<CtrTabView name="_post_type" value="shot" sprite="sp-shot-input" data-shot-mode={props.shotMode}>
										<div id="shot-preview" data-shot-preview="1"></div>

										<div className="shot-picker">
											<input type="radio" name="shot-type" className="shot top" data-shot="1" data-lls="shot-top" />
											<input type="radio" name="shot-type" className="shot btm" data-shot="0" data-lls="shot-btm" />
											<div id="shot-clear">
												<div className="sprite sp-clear centred" />
												<input type="radio" name="shot-type" data-shot-clear="1" />
											</div>
										</div>

										<input type="file" name="shot" data-shot-upload="1" disabled />
									</CtrTabView>
								)
							: null }

						<CtrTabView name="_post_type" value="painting" sprite="sp-memo-input">
							<img id="memo-img-input" src="" />
							<input type="hidden" name="painting" />
						</CtrTabView>
						<div className="spoiler-checkbox">
							<label htmlFor="cb-spoiler"><T k="new_post.spoiler_label" /></label>
							<CtrCheckbox id="cb-spoiler" name="spoiler" value="true" sprite="sp-spoiler" />
						</div>
					</CtrTabsView>
				</div>
				{props.errorText ? <p>{props.errorText}</p> : null}
				<input id="message_to_pid" type="hidden" name="message_to_pid" value={props.messagePid ?? undefined} />
				<input
					type="submit"
					id="submit"
					className="post-button"
				/>
			</form>
		</div>
	);
}

export function CtrNewPostPage(props: NewPostViewProps): ReactNode {
	const cache = useCache();
	const name = props.name ?? cache.getUserName(props.pid ?? 0);
	return (
		<CtrRoot title={T.str('new_post.post_to', { user: name })}>
			<CtrPageBody>
				<CtrNewPostView {...props} />
			</CtrPageBody>
		</CtrRoot>
	);
}
