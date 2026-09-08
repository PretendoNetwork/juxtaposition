import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import { CtrPageTitledHeader } from '@/services/juxt-web/views/ctr/components/CtrPageHeader';
import { CtrListView, CtrListViewItem } from '@/services/juxt-web/views/ctr/components/CtrListView';
import type { ReactNode } from 'react';
import type { UserSettingsViewProps } from '@/services/juxt-web/views/web/userSettingsView';

export function CtrUserSettingsView(props: UserSettingsViewProps): ReactNode {
	const settings = props.userSettings;
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
				<div className="body-content">
					<form method="post" action="/users/me/settings" id="settings-form">
						<CtrListView type="icon-column"> {/* TODO not icon column */}
							<CtrListViewItem>
								<label htmlFor="profile">
									<p className="settings-label"><T k="user_settings.show_profile" /></p>
									<input type="checkbox" id="profile" name="profile" value="true" checked={settings.profileVisibility !== 'users_only'} />
								</label>
							</CtrListViewItem>
							<CtrListViewItem>
								<label htmlFor="country">
									<p className="settings-label"><T k="user_settings.show_country" /></p>
									<input type="checkbox" id="country" name="country" value="true" checked={settings.countryVisible} />
								</label>
							</CtrListViewItem>
							<CtrListViewItem>
								<label htmlFor="birthday">
									<p className="settings-label"><T k="user_settings.show_birthday" /></p>
									<input type="checkbox" id="birthday" name="birthday" value="true" checked={settings.birthdayVisible} />
								</label>
							</CtrListViewItem>
							<CtrListViewItem>
								<label htmlFor="experience">
									<p className="settings-label"><T k="user_settings.show_game" /></p>
									<input type="checkbox" id="experience" name="experience" value="true" checked={settings.gameSkillVisible} />
								</label>
							</CtrListViewItem>
							<CtrListViewItem>
								<label htmlFor="notifyEmpathy">
									<p className="settings-label"><T k="user_settings.notify_empathy" /></p>
									<input type="checkbox" id="notifyEmpathy" name="notifyEmpathy" value="true" checked={settings.notifyEmpathy} />
								</label>
							</CtrListViewItem>
							<CtrListViewItem>
								<label htmlFor="notifyFollows">
									<p className="settings-label"><T k="user_settings.notify_follows" /></p>
									<input type="checkbox" id="notifyFollows" name="notifyFollows" value="true" checked={settings.notifyFollows} />
								</label>
							</CtrListViewItem>
							<CtrListViewItem>
								<label htmlFor="notifyReply">
									<p className="settings-label"><T k="user_settings.notify_reply" /></p>
									<input type="checkbox" id="notifyReply" name="notifyReply" value="true" checked={settings.notifyReply} />
								</label>
							</CtrListViewItem>
						</CtrListView>
						<input id="submit" type="submit" className="post-button" value={T.str('global.save')} />
					</form>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
