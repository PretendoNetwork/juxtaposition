import { createModule } from '@repo/frontend-common';
import type { BGM, SoundEffect } from '@pretendonetwork/cave-types';

function handleToolbarConfig(toolbarConfig: HTMLElement): void {
	var mode = toolbarConfig.getAttribute('data-toolbar-mode');
	var backgroundMusic = toolbarConfig.getAttribute('data-toolbar-bgm') as BGM | null;
	var sound = toolbarConfig.getAttribute('data-toolbar-sound') as SoundEffect | null;

	if (mode === 'wide') {
		var message = toolbarConfig.getAttribute('data-toolbar-message')!;

		cave.toolbar_setMode(1);
		cave.toolbar_setWideButtonMessage(message);

		// @ts-expect-error MESSAGE (8) missing from upstream types
		cave.toolbar_setCallback(8, function () {
			var submit = document.querySelector('#submit') as HTMLInputElement;
			submit.click();
		});
	} else {
		var activeButton = toolbarConfig.getAttribute('data-toolbar-active-button');

		cave.toolbar_setMode(0);

		if (activeButton) {
			cave.toolbar_setActiveButton(parseInt(activeButton));
		}
	}

	// incorrect upstream types on BGM
	var bgm = backgroundMusic ?? ('BGM_CAVE_MAIN' as BGM);
	cave.snd_playBgm(bgm);

	if (sound) {
		cave.snd_playSe(sound);
	}
}

export var toolbarConfigsModule = createModule({
	id: 'toolbarConfigs',
	selector: '[data-toolbar-mode]',
	hydrate({ el }) {
		handleToolbarConfig(el);
	}
});
