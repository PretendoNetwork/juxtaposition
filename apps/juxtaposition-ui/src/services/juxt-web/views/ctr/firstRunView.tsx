import { CtrPageBody, CtrRoot } from '@/services/juxt-web/views/ctr/root';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { FirstRunViewProps } from '@/services/juxt-web/views/web/firstRunView';

const AboutSection = {
	Root(props: { children?: ReactNode; id?: string; visible?: boolean }): ReactNode {
		return (
			<div id={props.id} className="about-wrapper background" style={{ display: props.visible ? 'block' : undefined }}>
				{props.children}
			</div>
		);
	},
	Title(props: { children?: ReactNode }): ReactNode {
		return (
			<h1 className="about-header">{props.children}</h1>
		);
	},
	Body(props: { children?: ReactNode }): ReactNode {
		return (
			<div className="about-body" style={{ position: 'relative' }}>
				{props.children}
			</div>
		);
	},
	BackButton(props: { currentId: string; onClick?: string; previousId?: string; text: string }): ReactNode {
		return (
			<input
				type="button"
				className="fixed-bottom-button left"
				value={props.text}
				data-sound="SE_WAVE_CANCEL"
				data-module-show={props.previousId ?? ''}
				data-module-hide={props.currentId}
				data-header="true"
				data-menu="false"
				evt-click={props.onClick}
			/>
		);
	},
	NextButton(props: { currentId: string; onClick?: string; nextId?: string; text: string; sound?: string }): ReactNode {
		return (
			<input
				type="submit"
				className="post-button fixed-bottom-button"
				value={props.text}
				data-sound={props.sound ?? 'SE_WAVE_MENU'}
				data-module-show={props.nextId ?? ''}
				data-module-hide={props.currentId}
				data-header="true"
				data-menu="false"
				evt-click={props.onClick}
			/>
		);
	}
};

export function CtrFirstRunView(_props: FirstRunViewProps): ReactNode {
	const sections = {
		welcome: 'welcome',
		beta: 'beta',
		about: 'about',
		manners: 'manners',
		analytics: 'analytics',
		experience: 'game-experience',
		ready: 'ready',
		end: 'have-fun'
	};

	const head = (
		<>
			<link rel="stylesheet" type="text/css" href="/assets/ctr/css/firstrun.css" />
			<script src="/assets/ctr/js/firstrun.global.js"></script>
		</>
	);

	return (
		<CtrRoot preventJsLoad title="First Run" onLoad="cave.snd_playBgm('BGM_CAVE_SYOKAI');cave.toolbar_setVisible(false);" head={head}>
			<CtrPageBody>
				<header id="header">
					<h1 id="page-title"><T k="setup.title" /></h1>
				</header>
				<div className="body-content">
					<div className="communities-list">

						<AboutSection.Root id={sections.welcome} visible>
							<AboutSection.Title><T k="setup.welcome" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.welcome_text" />
								</p>
							</AboutSection.Body>

							<AboutSection.BackButton currentId="add-post-page" text={T.str('global.exit')} onClick="cave.exitApp()" />
							<AboutSection.NextButton currentId={sections.welcome} nextId={sections.beta} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.beta}>
							<AboutSection.Title><T k="setup.beta" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.beta_text.first" />
									<br />
									<b><u><T k="setup.beta_text.second" /></u></b>
									<br />
									<T k="setup.beta_text.third" />
								</p>
							</AboutSection.Body>

							<AboutSection.BackButton currentId={sections.beta} previousId={sections.welcome} text={T.str('global.back')} />
							<AboutSection.NextButton currentId={sections.beta} nextId={sections.about} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.about}>
							<AboutSection.Title><T k="setup.info" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.info_text" />
								</p>
							</AboutSection.Body>

							<AboutSection.BackButton currentId={sections.about} previousId={sections.beta} text={T.str('global.back')} />
							<AboutSection.NextButton currentId={sections.about} nextId={sections.manners} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.manners}>
							<AboutSection.Title><T k="setup.rules" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.rules_text.first" />
									<br />
									<br />
									<div className="headline">
										<h2><T k="setup.rules_text.second" /></h2>
									</div>
									<T k="setup.rules_text.third" />
									<br />
									<br />
									<div className="headline">
										<h2><T k="setup.rules_text.fourth" /></h2>
									</div>
									<T k="setup.rules_text.fifth" />
									<br />
									<br />
									<div className="headline">
										<h2><T k="setup.rules_text.sixth" /></h2>
									</div>
									<T k="setup.rules_text.seventh" />
									<br />
									<br />
									<div className="headline">
										<h2><T k="setup.rules_text.eighth" /></h2>
									</div>
									<T k="setup.rules_text.ninth" />
									<br />
									<br />
									<div className="headline">
										<h2><T k="setup.rules_text.tenth" /></h2>
									</div>
									<T k="setup.rules_text.eleventh" />
									<br />
									<br />
									<div className="headline">
										<h2><T k="setup.rules_text.twelfth" /></h2>
									</div>
									<T k="setup.rules_text.thirteenth" />
									<br />
									<br />
								</p>
							</AboutSection.Body>

							<AboutSection.BackButton currentId={sections.manners} previousId={sections.about} text={T.str('global.back')} />
							<AboutSection.NextButton currentId={sections.manners} nextId={sections.analytics} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.analytics}>
							<AboutSection.Title><T k="setup.analytics" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.analytics_text" />
								</p>
							</AboutSection.Body>

							<AboutSection.BackButton currentId={sections.analytics} previousId={sections.manners} text={T.str('global.back')} />
							<AboutSection.NextButton currentId={sections.analytics} nextId={sections.experience} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.experience}>
							<AboutSection.Title><T k="setup.experience" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.experience_text.info" />
								</p>
							</AboutSection.Body>
							<div>
								<menu className="tab-header user-page">
									<li id="beginner" className="tab-button selected">
										<a data-sound="SE_WAVE_SELECT_TAB" evt-click="selectExperience(0)">
											<span className="new-post"><T k="setup.experience_text.beginner" /></span>
										</a>
									</li>
									<li id="intermediate" className="tab-button">
										<a data-sound="SE_WAVE_SELECT_TAB" evt-click="selectExperience(1)">
											<span><T k="setup.experience_text.intermediate" /></span>
										</a>
									</li>
									<li id="expert" className="tab-button">
										<a data-sound="SE_WAVE_SELECT_TAB" evt-click="selectExperience(2)">
											<span><T k="setup.experience_text.expert" /></span>
										</a>
									</li>
								</menu>
								<br />
								<br />
							</div>

							<AboutSection.BackButton currentId={sections.experience} previousId={sections.analytics} text={T.str('global.back')} />
							<AboutSection.NextButton currentId={sections.experience} nextId={sections.ready} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.ready}>
							<AboutSection.Title><T k="setup.ready" /></AboutSection.Title>
							<AboutSection.Body>
								<p>
									<T k="setup.ready_text" />
								</p>
							</AboutSection.Body>

							<AboutSection.BackButton currentId={sections.ready} previousId={sections.experience} text={T.str('global.back')} />
							<AboutSection.NextButton currentId={sections.ready} onClick="cave.snd_playBgm('BGM_CAVE_SYOKAI2');submitFirstRun()" sound="GL_OLV_INIT_END" nextId={sections.end} text={T.str('global.next')} />
						</AboutSection.Root>

						<AboutSection.Root id={sections.end}>
							<AboutSection.Title />
							<AboutSection.Body>
								<AboutSection.Title><T k="setup.done" /></AboutSection.Title>
							</AboutSection.Body>
							<br />
							<br />
							<br />
							<br />
							<div className="center">
								<button
									className="about-button"
									evt-click="window.location.replace('/titles')"
								>
									<T k="setup.done_button" />
								</button>
							</div>
						</AboutSection.Root>
					</div>
				</div>
			</CtrPageBody>
		</CtrRoot>
	);
}
