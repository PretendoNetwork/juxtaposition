import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import type { ReactNode } from 'react';
import type { UserSettingsViewProps } from '@/services/juxt-web/views/web/userSettingsView';

export function CtrUserSettingsView(props: UserSettingsViewProps): ReactNode {
	return (
		<CtrRoot ctx={props.ctx} title="Whoops!">
			<CtrPageBody>
				<header
					id="header"
					data-toolbar-config
					data-toolbar-mode="1"
					data-toolbar-message="Save Settings"
					data-toolbar-onclick="saveUserSettings"
					data-toolbar-onback="exitUserSettings"
					data-toolbar-bgm="BGM_CAVE_SETTING"
					data-toolbar-exit-bgm="BGM_CAVE_MAIN_LOOP_NOWAIT"
				>
					<h1 id="page-title">User Settings</h1>
				</header>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="tab-body">
						<form method="post" action="/users/me/settings" id="settings-form">
							<ul className="list-content-with-icon-column settings-list">
								<li data-name="profile_comment_visibility" className="scroll">
									<label className="checkbox-container" htmlFor="country">
										<p className="settings-label">{props.ctx.lang.user_settings.show_country}</p>
										<input type="checkbox" id="country" name="country" value="true" checked={!!props.userSettings?.country_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li data-name="game_skill" className="scroll">
									<label className="checkbox-container" htmlFor="birthday">
										<p className="settings-label">{props.ctx.lang.user_settings.show_birthday}</p>
										<input type="checkbox" id="birthday" name="birthday" value="true" checked={!!props.userSettings?.birthday_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li data-name="game_skill_visibility" className="scroll">
									<label className="checkbox-container" htmlFor="experience">
										<p className="settings-label">{props.ctx.lang.user_settings.show_game}</p>
										<input type="checkbox" id="experience" name="experience" value="true" checked={!!props.userSettings?.game_skill_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<input id="submit" type="submit" className="post-button fixed-bottom-button" value="Save" />
							</ul>
						</form>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
