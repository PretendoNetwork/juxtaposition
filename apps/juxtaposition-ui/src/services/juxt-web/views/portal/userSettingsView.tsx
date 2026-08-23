import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
import { PortalNavBar } from '@/services/juxt-web/views/portal/components/PortalNavBar';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { UserSettingsViewProps } from '@/services/juxt-web/views/web/userSettingsView';

export function PortalUserSettingsView(props: UserSettingsViewProps): ReactNode {
	const settings = props.userSettings;
	return (
		<PortalRoot title={T.str('user_settings.profile_settings')}>
			<PortalNavBar selection={1} />
			<PortalPageBody>
				<header id="header"></header>
				<div className="body-content">
					<form method="post" action="/users/me/settings" id="settings-form">
						<div className="settings-list-content">
							<ul className="settings-list">
								<li>
									<p className="settings-label"><T k="user_settings.show_profile" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="profile" name="profile" value="true" checked={settings.profileVisibility !== 'users_only'} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li>
									<p className="settings-label"><T k="user_settings.show_country" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="country" name="country" value="true" checked={settings.countryVisible} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li>
									<p className="settings-label"><T k="user_settings.show_birthday" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="birthday" name="birthday" value="true" checked={settings.birthdayVisible} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li>
									<p className="settings-label"><T k="user_settings.show_game" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="experience" name="experience" value="true" checked={settings.gameSkillVisible} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li>
									<p className="settings-label"><T k="user_settings.notify_empathy" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="notifyEmpathy" name="notifyEmpathy" value="true" checked={settings.notifyEmpathy} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li>
									<p className="settings-label"><T k="user_settings.notify_follows" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="notifyFollows" name="notifyFollows" value="true" checked={settings.notifyFollows} />
										<span className="checkmark"></span>
									</label>
								</li>
								<li>
									<p className="settings-label"><T k="user_settings.notify_reply" /></p>
									<label className="checkbox-container">
										<input type="checkbox" id="notifyReply" name="notifyReply" value="true" checked={settings.notifyReply} />
										<span className="checkmark"></span>
									</label>
								</li>
								<input type="submit" className="post-button fixed-bottom-button" value={T.str('global.save')} />
							</ul>
						</div>
					</form>
				</div>
			</PortalPageBody>
		</PortalRoot>
	);
}
