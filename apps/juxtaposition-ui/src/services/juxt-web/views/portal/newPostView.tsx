import type { NewPostViewProps } from '@/services/juxt-web/views/web/newPostView';
import type { ReactNode } from 'react';

const empathies = [
	{
		value: 0,
		miiFaceFile: 'normal_face.png',
		sound: 'SE_WAVE_MII_FACE_00',
		className: 'feeling-button-normal'
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

export function PortalNewPostView(props: NewPostViewProps): ReactNode {
	return (
		<div id="add-post-page" className="add-post-page official-user-post">
			<header className="add-post-page-header">
				<h1 className="page-title">
					{props.ctx.lang.new_post.post_to}
					{' '}
					{props.name}
				</h1>
			</header>
			<form method="post" action={props.url} id="posts-form" data-is-own-title="1" data-is-identified="1">
				<input type="hidden" name="community_id" defaultValue={props.id} />
				<div className="add-post-page-content">
					<div className="feeling-selector expression">
						<img src={`${props.ctx.cdnUrl}/mii/${props.ctx.pid}/normal_face.png`} id="mii-face" className="icon" />
						<ul className="buttons">
							{empathies.map(v => (
								<li key={v.value}>
									<input
										type="radio"
										name="feeling_id"
										defaultValue={v.value}
										className={v.className}
										data-mii-face-url={`${props.ctx.cdnUrl}/mii/${props.ctx.pid}/${v.miiFaceFile}`}
										defaultChecked
										data-sound={v.sound}
									/>
								</li>
							))}
						</ul>
					</div>
					<div className="image-selector dropdown">
						<label data-toggle="dropdown" className="dropdown-toggle" data-sound="SE_WAVE_BALLOON_OPEN">
							<img className="preview-image" src="/images/add-post-no-image.png" />
							<input type="checkbox" id="screenshot-toggle" name="_screenshot_value" />
							<div className="image-selector-window dropdown-menu">
								<menu className="screenshot-menu">
									<li className="image-wrapper">
										<input type="radio" name="_screenshot_value" defaultValue="top" defaultChecked data-sound="" evt-click="chooseScreenShot(0)" />
										<img id="top-screen" src="" className="capture-image" />
									</li>
									<li className="image-wrapper">
										<input type="radio" name="_screenshot_value" defaultValue="bottom" data-sound="" evt-click="chooseScreenShot(1)" />
										<img id="bottom-screen" src="" className="capture-image" />
									</li>
									<li className="button">
										<input type="radio" name="_screenshot_value" defaultValue="none" data-sound="" evt-click="chooseScreenShot()" />
										No Screenshot
									</li>
								</menu>
							</div>
						</label>
						<input id="screenshot-value" type="hidden" name="screenshot" defaultValue="" />
					</div>
					<div className="textarea-container textarea-with-menu active-text">
						<menu className="textarea-menu">
							<li className="textarea-menu-text">
								<input type="radio" name="_post_type" defaultValue="body" defaultChecked data-sound="" />
								<textarea name="body" className="textarea-text" defaultValue="" maxLength={280} placeholder="Enter text here..." data-alert-text={props.ctx.lang.user_settings.swearing} evt-change="if(wiiuFilter.checkWord(this.value) === -2) { this.value = ''; alert(el.getAttribute('data-alert-text'));}"></textarea>
							</li>
							<li className="textarea-menu-memo">
								<input type="radio" name="_post_type" defaultValue="painting" data-sound="" evt-click="newPainting(false)" />
								<div className="textarea-memo trigger" data-sound="" evt-click="newPainting(false)">
									<img id="memo" className="textarea-memo-preview" src="" />
									<input id="memo-value" type="hidden" name="painting" />
								</div>
							</li>
						</menu>
					</div>
					<label className="checkbox-container spoiler-button">
						Spoilers
						<input type="checkbox" id="spoiler" name="spoiler" defaultValue="true" />
						<span className="checkmark"></span>
					</label>
				</div>
				<input id="message_to_pid" type="hidden" name="message_to_pid" defaultValue={props.messagePid ?? undefined} />
				<input
					type="button"
					className="olv-modal-close-button fixed-bottom-button left"
					defaultValue="Cancel"
					data-sound="SE_WAVE_CANCEL"
					data-module-show={props.show}
					data-module-hide="add-post-page"
					data-header="true"
					data-menu="true"
				/>
				<input type="submit" className="post-button fixed-bottom-button" defaultValue="Post" evt-click="wiiuBrowser.lockUserOperation(true);" />
			</form>
		</div>
	);
}
