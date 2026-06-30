import { T } from '@/services/juxt-web/views/common/components/T';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useUser } from '@/services/juxt-web/views/common/hooks/useUser';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import type { ReactNode } from 'react';
import type { CommunityShotMode } from '@/models/communities';
import type { Community } from '@/api/generated';

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
	id: string;
	// must provide name OR pid
	name?: string;
	pid?: number;
	url: string;
	show: string;
	// must provide messagePid OR community
	messagePid?: number;
	community?: Community;
	shotMode: CommunityShotMode;

	// Error feedback
	errorText?: string;
};

export function WebNewPostView(props: NewPostViewProps): ReactNode {
	const url = useUrl();
	const user = useUser();
	return (
		<div id="add-post-page" className="add-post-page official-user-post">
			<form method="post" action={props.url} id="posts-form">
				{props.errorText ? <p>{props.errorText}</p> : null}
				<input type="hidden" name="community_id" value={props.id} />
				<div className="add-post-page-content">
					<div className="feeling-selector expression">
						<img src={url.cdn(`/mii/${user.pid}/normal_face.png`)} id="mii-face" className="icon" />
						<ul className="buttons">
							{empathies.map(v => (
								<li key={v.value}>
									<input
										type="radio"
										name="feeling_id"
										value={v.value}
										className={v.className}
										data-mii-face-url={url.cdn(`/mii/${user.pid}/${v.miiFaceFile}`)}
										defaultChecked={v.isDefault}
										data-sound={v.sound}
									/>
								</li>
							))}
						</ul>
					</div>
					<div className="textarea-container textarea-with-menu active-text">
						<input type="hidden" name="_post_type" value="body" />
						<textarea id="new-post-text" name="body" className="textarea-text" value="" maxLength={280} placeholder={T.str('new_post.content_placeholder')}></textarea>
					</div>
					<label className="checkbox-container spoiler-button">
						<T k="new_post.spoiler_label" />
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
					/>
					<input type="submit" className="post-button fixed-bottom-button" value="Post" />
				</div>
			</form>
		</div>
	);
}

export function WebNewPostPage(props: NewPostViewProps): ReactNode {
	const cache = useCache();
	const user = useUser();
	const name = props.name ?? cache.getUserName(props.pid ?? 0);

	let content = <WebNewPostView {... props} />;
	if (!user.perms.moderator) {
		content = (
			<div>
				<p>Posting is disabled on web</p>
			</div>
		);
	}

	return (
		<WebRoot>
			<h2 id="title" className="page-header">
				<T k="new_post.post_to" values={{ user: name ?? '' }} />
			</h2>
			<WebWrapper className="community-page-post-box">
				{content}
			</WebWrapper>
		</WebRoot>
	);
}
