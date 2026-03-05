import cx from 'classnames';
import { t } from 'i18next';
import { CtrTabsView, CtrTabView } from '@/services/juxt-web/views/ctr/controls/ctabs';
import { CtrCheckbox } from '@/services/juxt-web/views/ctr/controls/checkbox';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
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
	const { ctrBanner, ctrLegacy } = props;
	const name = props.name ?? cache.getUserName(props.pid ?? 0);
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

				data-toolbar-mode="wide"
				data-toolbar-message={t('new_post.post_to') + ' ' + name}
			>
				<h1 id="page-title">
					<T k="new_post.post_to" />
					{' '}
					{name}
				</h1>
			</header>
			<form method="post" action={props.url} id="posts-form" data-is-own-title="1" data-is-identified="1">
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
								placeholder="Share your thoughts in a post to a community or to your followers."
							/>
						</CtrTabView>
						{props.allowShot
							? (
									<CtrTabView name="_post_type" value="shot" sprite="sp-shot-input">
										<div id="shot-msg">Screenshots are not ready yet. Check back soon!</div>
									</CtrTabView>
								)
							: null }

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
		<CtrRoot title={t('new_post.post_to') + ' ' + name}>
			<CtrPageBody>
				<CtrNewPostView {...props} />
			</CtrPageBody>
		</CtrRoot>
	);
}
