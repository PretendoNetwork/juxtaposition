import { PortalPageBody, PortalRoot } from '@/services/juxt-web/views/portal/root';
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
				data-header="false"
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
				data-header="false"
				data-menu="false"
				evt-click={props.onClick}
			/>
		);
	}
};

export function PortalFirstRunView(props: FirstRunViewProps): ReactNode {
	const sections = {
		welcome: 'welcome',
		beta: 'beta',
		about: 'about',
		manners: 'manners',
		ga: 'google-analytics',
		experience: 'game-experience',
		ready: 'ready',
		end: 'have-fun'
	};

	const head = (
		<>
			<link rel="stylesheet" type="text/css" href="/css/firstrun.css" />
			<script src="/js/firstrun.global.js"></script>
		</>
	);

	return (
		<PortalRoot ctx={props.ctx} title="" onLoad="wiiuBrowser.endStartUp(); wiiuSound.playSoundByName('BGM_OLV_INIT', 3);" head={head}>
			<PortalPageBody>
				<AboutSection.Root id={sections.welcome} visible>
					<AboutSection.Title>{props.ctx.lang.setup.welcome}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{props.ctx.lang.setup.welcome_text}
						</p>
					</AboutSection.Body>

					<AboutSection.BackButton currentId="add-post-page" text={props.ctx.lang.global.exit} onClick="exit()" />
					<AboutSection.NextButton currentId={sections.welcome} nextId={sections.beta} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.beta}>
					<AboutSection.Title>{props.ctx.lang.setup.beta}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{props.ctx.lang.setup.beta_text.first}
							<br />
							<b><u>{props.ctx.lang.setup.beta_text.second}</u></b>
							<br />
							{props.ctx.lang.setup.beta_text.third}
						</p>
					</AboutSection.Body>

					<AboutSection.BackButton currentId={sections.beta} previousId={sections.welcome} text={props.ctx.lang.global.back} />
					<AboutSection.NextButton currentId={sections.beta} nextId={sections.about} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.about}>
					<AboutSection.Title>{props.ctx.lang.setup.info}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{props.ctx.lang.setup.info_text}
						</p>
					</AboutSection.Body>

					<AboutSection.BackButton currentId={sections.about} previousId={sections.beta} text={props.ctx.lang.global.back} />
					<AboutSection.NextButton currentId={sections.about} nextId={sections.manners} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.manners}>
					<AboutSection.Title>{props.ctx.lang.setup.rules}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{ props.ctx.lang.setup.rules_text.first }
							<br />
							<br />
							<div className="headline">
								<h2>{ props.ctx.lang.setup.rules_text.second }</h2>
							</div>
							{ props.ctx.lang.setup.rules_text.third }
							<br />
							<br />
							<div className="headline">
								<h2>{ props.ctx.lang.setup.rules_text.fourth }</h2>
							</div>
							{ props.ctx.lang.setup.rules_text.fifth }
							<br />
							<br />
							<div className="headline">
								<h2>{ props.ctx.lang.setup.rules_text.sixth }</h2>
							</div>
							{ props.ctx.lang.setup.rules_text.seventh }
							<br />
							<br />
							<div className="headline">
								<h2>{ props.ctx.lang.setup.rules_text.eighth }</h2>
							</div>
							{ props.ctx.lang.setup.rules_text.ninth }
							<br />
							<br />
							<div className="headline">
								<h2>{ props.ctx.lang.setup.rules_text.tenth }</h2>
							</div>
							{ props.ctx.lang.setup.rules_text.eleventh }
							<br />
							<br />
							<div className="headline">
								<h2>{ props.ctx.lang.setup.rules_text.twelfth }</h2>
							</div>
							{ props.ctx.lang.setup.rules_text.thirteenth }
							<br />
							<br />
						</p>
					</AboutSection.Body>

					<AboutSection.BackButton currentId={sections.manners} previousId={sections.about} text={props.ctx.lang.global.back} />
					<AboutSection.NextButton currentId={sections.manners} nextId={sections.ga} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.ga}>
					<AboutSection.Title>{props.ctx.lang.setup.google}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{ props.ctx.lang.setup.google_text }
						</p>
					</AboutSection.Body>

					<AboutSection.BackButton currentId={sections.ga} previousId={sections.manners} text={props.ctx.lang.global.back} />
					<AboutSection.NextButton currentId={sections.ga} nextId={sections.experience} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.experience}>
					<AboutSection.Title>{props.ctx.lang.setup.experience}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{ props.ctx.lang.setup.experience_text.info }
						</p>
					</AboutSection.Body>
					<div>
						<br />
						<br />
						<ul className="horizontal-list">
							<li id="beginner" evt-click="selectExperience(0)" className="selected"><a href="#">{ props.ctx.lang.setup.experience_text.beginner }</a></li>
							<li id="intermediate" evt-click="selectExperience(1)"><a href="#">{ props.ctx.lang.setup.experience_text.intermediate }</a></li>
							<li id="expert" evt-click="selectExperience(2)"><a href="#">{ props.ctx.lang.setup.experience_text.expert }</a></li>
						</ul>
					</div>

					<AboutSection.BackButton currentId={sections.experience} previousId={sections.ga} text={props.ctx.lang.global.back} />
					<AboutSection.NextButton currentId={sections.experience} nextId={sections.ready} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.ready}>
					<AboutSection.Title>{props.ctx.lang.setup.ready}</AboutSection.Title>
					<AboutSection.Body>
						<p>
							{ props.ctx.lang.setup.ready_text }
						</p>
					</AboutSection.Body>

					<AboutSection.BackButton currentId={sections.ready} previousId={sections.experience} text={props.ctx.lang.global.back} />
					<AboutSection.NextButton currentId={sections.ready} onClick="firstRunSubmit()" sound="GL_OLV_INIT_END" nextId={sections.end} text={props.ctx.lang.global.next} />
				</AboutSection.Root>

				<AboutSection.Root id={sections.end}>
					<AboutSection.Title>{props.ctx.lang.setup.done}</AboutSection.Title>
					<br />
					<br />
					<br />
					<br />
					<div className="center">
						<button
							className="about-button"
							evt-click="wiiuSound.playSoundByName('SE_WAVE_MENU', 1); wiiuSound.playSoundByName('BGM_OLV_MAIN', 3); window.location.replace('/titles')"
						>
							{ props.ctx.lang.setup.done_button }
						</button>
					</div>
				</AboutSection.Root>
			</PortalPageBody>
		</PortalRoot>
	);
}
