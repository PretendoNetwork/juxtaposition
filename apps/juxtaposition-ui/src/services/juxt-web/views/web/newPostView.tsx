import { utils } from '@/services/juxt-web/views/utils';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { ReactNode } from 'react';

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

export type NewPostViewProps = {
	ctx: RenderContext;
	id: string;
	name: string;
	url: string;
	show: string;
	messagePid: number;
};

export function WebNewPostView(props: NewPostViewProps): ReactNode {
	return (
		<div id="add-post-page" className="add-post-page official-user-post" style={{ display: 'none' }}>
			<form method="post" action={props.url} id="posts-form" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="community_id" value={props.id} />
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
					<div className="textarea-container textarea-with-menu active-text">
						<menu className="textarea-menu">
							<li className="textarea-menu-text">
								<input type="radio" name="_post_type" value="body" defaultChecked data-sound="" evt-click="openText()" />
							</li>
							<li className="textarea-menu-memo">
								<input type="radio" name="_post_type" value="painting" data-sound="" evt-click="newPainting(false)" disabled />
							</li>
						</menu>
						<textarea id="new-post-text" name="body" className="textarea-text" value="" maxLength={280} placeholder="Enter text here..."></textarea>
						<div id="new-post-memo" className="textarea-memo trigger" data-sound="" evt-click="newPainting(false)" style={{ display: 'none' }}>
							<img id="memo" className="textarea-memo-preview" src="" />
							<input id="memo-value" type="hidden" name="painting" />
						</div>
					</div>
					<label className="checkbox-container spoiler-button">
						Spoilers
						<input type="checkbox" id="spoiler" name="spoiler" value="true" />
						<span className="checkmark"></span>
					</label>
				</div>
				<div id="button-wrapper">
					<input id="message_to_pid" type="hidden" name="message_to_pid" value={props.messagePid ?? undefined} />
					<input
						type="button"
						className="olv-modal-close-button fixed-bottom-button left"
						value="Cancel"
						data-sound="SE_WAVE_CANCEL"
						data-module-show={props.show}
						data-module-hide="add-post-page"
						data-header="true"
						data-menu="true"
					/>
					<input type="submit" className="post-button fixed-bottom-button" value="Post" />
				</div>
			</form>
		</div>
	);
}
