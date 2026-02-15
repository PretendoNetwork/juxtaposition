import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/navbar';
import type { ReactNode } from 'react';
import type { UserSettingsViewProps } from '@/services/juxt-web/views/web/userSettingsView';

export function PortalUserSettingsView(props: UserSettingsViewProps): ReactNode {
	return (
		<PortalRoot title={props.ctx.lang.user_settings.profile_settings}>
			<PortalNavBar ctx={props.ctx} selection={1} />
			<PortalPageBody>
				<header id="header"></header>
				<div className="body-content">
					<form method="post" action="/users/me/settings" id="settings-form">
						<div className="settings-list-content">
							<ul className="settings-list">
								<li data-name="profile_comment_visibility" className="scroll">
									<p className="settings-label">{props.ctx.lang.user_settings.show_country}</p>
									<label className="checkbox-container">
										<input type="checkbox" id="country" name="country" value="true" checked={!!props.userSettings?.country_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li data-name="game_skill" className="scroll">
									<p className="settings-label">{props.ctx.lang.user_settings.show_birthday}</p>
									<label className="checkbox-container">
										<input type="checkbox" id="birthday" name="birthday" value="true" checked={!!props.userSettings?.birthday_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li data-name="game_skill_visibility" className="scroll">
									<p className="settings-label">{props.ctx.lang.user_settings.show_game}</p>
									<label className="checkbox-container">
										<input type="checkbox" id="experience" name="experience" value="true" checked={!!props.userSettings?.game_skill_visibility} />
										<span className="checkmark"></span>
									</label>
								</li>
								<input type="submit" className="post-button fixed-bottom-button" value="Save" />
							</ul>
						</div>
					</form>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
