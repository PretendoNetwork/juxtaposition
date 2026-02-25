import type { BGM, SoundEffect } from '@pretendonetwork/cave-types';

export function initToolbarConfigs(): void {
	var toolbarConfig = document.querySelector('[data-toolbar-config]');
	if (!toolbarConfig) {
		return;
	}
	var mode = toolbarConfig.getAttribute('data-toolbar-mode');
	var message = toolbarConfig.getAttribute('data-toolbar-message');
	var clickHandle = toolbarConfig.getAttribute('data-toolbar-onclick');
	var backHandle = toolbarConfig.getAttribute('data-toolbar-onback');
	var activeButton = toolbarConfig.getAttribute('data-toolbar-active-button');
	var backgroundMusic = toolbarConfig.getAttribute('data-toolbar-bgm') as BGM | null;
	var backgroundMusicExit = toolbarConfig.getAttribute('data-toolbar-exit-bgm') as BGM | null;
	var sound = toolbarConfig.getAttribute('data-toolbar-sound') as SoundEffect | null;

	if (mode) {
		cave.toolbar_setMode(parseInt(mode));
	}

	if (message) {
		cave.toolbar_setWideButtonMessage(message);
	}

	if (clickHandle) {
		// @ts-expect-error MESSAGE (8) missing from upstream types
		cave.toolbar_setCallback(8, function () {
			cave.toolbar_setMode(0);
			cave.toolbar_setButtonType(0);
			if (backgroundMusicExit) {
				cave.snd_playBgm(backgroundMusicExit);
			}
			// @ts-expect-error indexing on window
			eval(window[clickHandle!]).call();
		});
	}

	if (backHandle) {
		function goBackHandle(): void {
			cave.toolbar_setMode(0);
			cave.toolbar_setButtonType(0);
			if (backgroundMusicExit) {
				cave.snd_playBgm(backgroundMusicExit);
			}
			// @ts-expect-error indexing on window
			eval(window[backHandle!]).call();
		}
		cave.toolbar_setCallback(1, goBackHandle);
		cave.toolbar_setCallback(99, goBackHandle);
	}

	if (activeButton) {
		cave.toolbar_setActiveButton(parseInt(activeButton));
	}

	if (backgroundMusic) {
		cave.snd_playBgm(backgroundMusic);
	}

	if (sound) {
		cave.snd_playSe(sound);
	}
}
