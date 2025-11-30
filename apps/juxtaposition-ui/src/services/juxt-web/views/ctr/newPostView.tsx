import { utils } from '@/services/juxt-web/views/utils';
import type { ReactNode } from 'react';
import type { NewPostViewProps } from '@/services/juxt-web/views/web/newPostView';

const empathies = [
	{
		value: 0,
		miiFaceFile: 'normal_face.png',
		sound: 'SE_WAVE_MII_FACE_00',
		className: 'feeling-button-normal',
		isDefault: true
	},
	{
		value: 1,
		miiFaceFile: 'smile_open_mouth.png',
		sound: 'SE_WAVE_MII_FACE_01',
		className: 'feeling-button-happy'
	},
	{
		value: 2,
		miiFaceFile: 'wink_left.png',
		sound: 'SE_WAVE_MII_FACE_02',
		className: 'feeling-button-like'
	},
	{
		value: 3,
		miiFaceFile: 'surprise_open_mouth.png',
		sound: 'SE_WAVE_MII_FACE_03',
		className: 'feeling-button-surprised'
	},
	{
		value: 4,
		miiFaceFile: 'frustrated.png',
		sound: 'SE_WAVE_MII_FACE_04',
		className: 'feeling-button-frustrated'
	},
	{
		value: 5,
		miiFaceFile: 'sorrow.png',
		sound: 'SE_WAVE_MII_FACE_05',
		className: 'feeling-button-puzzled'
	}
];

export function CtrNewPostView(props: NewPostViewProps): ReactNode {
	return (
		<div id="add-post-page" className="add-post-page official-user-post">
			<header id="header">
				<h1 id="page-title">
					{props.ctx.lang.new_post.post_to}
					{' '}
					{props.name}
				</h1>
			</header>
			<form method="post" action={props.url} id="posts-form" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="community_id" value={props.id} />
				<input type="hidden" name="bmp" value="true" />
				<div className="add-post-page-content">
					<div className="feeling-selector expression">
						<img src={utils.cdn(props.ctx, `/mii/${props.ctx.pid}/normal_face.png`)} id="mii-face" className="icon" />
						<ul className="buttons">
							{empathies.map(v => (
								<li key={v.value}>
									<input
										type="radio"
										name="feeling_id"
										value={v.value}
										className={v.className}
										data-mii-face-url={utils.cdn(props.ctx, `/mii/${props.ctx.pid}/${v.miiFaceFile}`)}
										defaultChecked={v.isDefault}
										data-sound={v.sound}
									/>
								</li>
							))}
						</ul>
					</div>
					<div className="image-selector dropdown">
						<button
							id="screenshot-button"
							type="button"
							data-toggle="dropdown"
							className="dropdown-toggle"
							data-sound="SE_WAVE_BALLOON_OPEN"
							evt-click="window.alert('Screenshots are not ready yet. Check back soon!')"
						>
							<img className="preview-image sprite" src="" />
						</button>
						<input id="screenshot-value" type="hidden" name="screenshot" value="" />
					</div>
					<div className="textarea-container textarea-with-menu active-text">
						<menu className="textarea-menu">
							<li className="textarea-menu-text">
								<span className="sprite text-input selected" id="text-sprite"></span>
								<input
									type="radio"
									name="_post_type"
									value="body"
									defaultChecked
									data-sound=""
									evt-click="newText()"
								/>
								<textarea
									name="body"
									id="post-text"
									className="textarea-text selected"
									value=""
									maxLength={280}
									placeholder="Share your thoughts in a post to a community or to your followers."
								>
								</textarea>
							</li>
							<li className="textarea-menu-memo">
								<span className="sprite memo" id="memo-sprite"></span>
								<input
									type="radio"
									name="_post_type"
									value="painting"
									data-sound=""
									evt-click="newPainting(false)"
								/>
								<div className="textarea-memo" id="post-memo" data-sound="" evt-click="newPainting(false)">
									<img id="memo" className="textarea-memo-preview" src="" />
									<input id="memo-value" type="hidden" name="painting" />
								</div>
							</li>
						</menu>
					</div>
					<div className="checkbox-container spoiler-button">
						<span>
							<label htmlFor="spoiler">Spoiler</label>
							<input type="checkbox" id="spoiler" name="spoiler" value="true" />
						</span>
					</div>
				</div>
				<input id="message_to_pid" type="hidden" name="message_to_pid" value={props.messagePid ?? undefined} />
				<input
					id="close-modal-button"
					type="button"
					className="olv-modal-close-button fixed-bottom-button left"
					value="Cancel"
					data-sound="SE_WAVE_CANCEL"
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
