import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import type { ReactNode } from 'react';
import type { UserSettingsViewProps } from '@/services/juxt-web/views/web/userSettingsView';

export function CtrUserSettingsView(props: UserSettingsViewProps): ReactNode {
	return (
		<CtrRoot title="Whoops!">
			<CtrPageBody>
				<CtrPageTitledHeader
					data-toolbar-mode="wide"
					data-toolbar-message={T.str('user_settings.save_action')}
					data-toolbar-bgm="BGM_CAVE_SETTING"
				>
					<T k="user_settings.profile_settings" />
				</CtrPageTitledHeader>
				<div className="body-content tab2-content" id="community-post-list">
					<div className="tab-body">
						<form method="post" action="/users/me/settings" id="settings-form">
							<ul className="list-content-with-icon-column settings-list">
								<li data-name="profile_comment_visibility" className="scroll">
									<label className="checkbox-container" htmlFor="country">
										<p className="settings-label"><T k="user_settings.show_country" /></p>
										<input type="checkbox" id="country" name="country" value="true" checked={!!props.userSettings?.country_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li data-name="game_skill" className="scroll">
									<label className="checkbox-container" htmlFor="birthday">
										<p className="settings-label"><T k="user_settings.show_birthday" /></p>
										<input type="checkbox" id="birthday" name="birthday" value="true" checked={!!props.userSettings?.birthday_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li data-name="game_skill_visibility" className="scroll">
									<label className="checkbox-container" htmlFor="experience">
										<p className="settings-label"><T k="user_settings.show_game" /></p>
										<input type="checkbox" id="experience" name="experience" value="true" checked={!!props.userSettings?.game_skill_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<input id="submit" type="submit" className="post-button fixed-bottom-button" value={T.str('global.save')} />
							</ul>
						</form>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
