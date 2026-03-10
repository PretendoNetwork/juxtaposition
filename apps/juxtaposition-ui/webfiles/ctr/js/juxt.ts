import './polyfills';

import { tabsModule } from '@/js/modules/tabs';
import { morePostsModule } from '@/js/modules/more-posts';
import { checkForUpdates, updatesModule } from '@/js/modules/updates';
import { postsModule } from '@/js/modules/posts';
import { spoilersModule } from '@/js/modules/spoilers';
import { modules } from '@/js/module-container';
import { checkboxModule } from './modules/controls/checkbox';
import { ctabsModule } from './modules/controls/ctabs';
import { newPostViewModule } from './modules/new-post-view';
import { pjaxBack, pjaxCanGoBack, pjaxInit, pjaxLoadUrl } from './pjax';
import { deleteButtonModule, yeahButtonModule } from './modules/post';
import { toolbarConfigsModule } from './modules/toolbar';
import { POST } from './xhr';

declare global {
	interface Window {
		stopLoading: () => void;
		follow: (el: HTMLInputElement) => void;
		saveUserSettings: () => void;
		exitUserSettings: () => void;
	}
}

cave.toolbar_setCallback(1, back);
cave.toolbar_setCallback(99, back);
cave.toolbar_setCallback(2, function () {
	cave.toolbar_setActiveButton(2);
	pjaxLoadUrl('/feed', true);
});
cave.toolbar_setCallback(3, function () {
	cave.toolbar_setActiveButton(3);
	pjaxLoadUrl('/titles', true);
});
cave.toolbar_setCallback(4, function () {
	cave.toolbar_setActiveButton(4);
	checkForUpdates();
	pjaxLoadUrl('/news/my_news', true);
});
cave.toolbar_setCallback(5, function () {
	cave.toolbar_setActiveButton(5);
	pjaxLoadUrl('/users/me', true);
});
// @ts-expect-error MESSAGE (8) missing from upstream types
cave.toolbar_setCallback(8, function () { });

function back(): void {
	if (!pjaxCanGoBack()) {
		cave.toolbar_setButtonType(0);
	} else {
		pjaxBack();
	}
}

function stopLoading(): void {
	if (window.location.href.indexOf('/titles/show/first') !== -1) {
		return;
	}
	cave.transition_end();
	cave.lls_setItem('agree_olv', '1');
	// @ts-expect-error incorrect upstream types
	cave.snd_playBgm('BGM_CAVE_MAIN');
	cave.toolbar_setVisible(true);
}
window.stopLoading = stopLoading;

function follow(el: HTMLInputElement): void {
	var id = el.getAttribute('data-community-id');
	var count = document.getElementById('followers')!;
	var sprite = el.querySelector('.sprite.sp-yeah')!;
	el.disabled = true;
	var params = 'id=' + id;
	if (sprite.classList.toggle('selected')) {
		// @ts-expect-error incorrect upstream types for SE label
		cave.snd_playSe('SE_OLV_MII_ADD');
	} else {
		// @ts-expect-error incorrect upstream types for SE label
		cave.snd_playSe('SE_OLV_CANCEL');
	}

	var url = el.getAttribute('data-url')!;
	POST(url, params, function a(data) {
		var element = JSON.parse(data.responseText);
		if (!element || element.status !== 200) {
			// Apparently there was an actual error code for not being able to yeah a post, who knew!
			// TODO: Find more of these
			return cave.error_callErrorViewer(155927);
		}
		el.disabled = false;
		count.innerText = element.count;
	});
}
window.follow = follow;

function saveUserSettings(): void {
	var submitButton = document.getElementById('submit');
	if (submitButton) {
		submitButton.click();
	}
}
window.saveUserSettings = saveUserSettings;
function exitUserSettings(): void {
	pjaxLoadUrl('/users/me', true);
	cave.toolbar_setButtonType(1);
}
window.exitUserSettings = exitUserSettings;

document.addEventListener('DOMContentLoaded', function () {
	pjaxInit({
		elements: 'a[data-pjax]',
		selectors: ['title', '#body']
	});
	console.debug('Pjax initialized.');
	modules.loadBody();
	stopLoading();
});
document.addEventListener('PjaxRequest', function () {
	cave.transition_begin();
});
document.addEventListener('PjaxDone', function () {
	modules.loadBody();
	cave.brw_scrollImmediately(0, 0);
	if (pjaxCanGoBack()) {
		cave.toolbar_setButtonType(1);
	} else {
		cave.toolbar_setButtonType(0);
	}
	cave.requestGc();
	cave.transition_end();
});

/* CTR WebKit has an odd bug where images that fail to load throw off the
 * entire page render, spritesheets, layout.
 * Ensuring we have *something* loaded seems to fix it.
 * Ideally we never trigger this since we don't have page errors, but it happens,
 * especially when selfhosting. */
document.addEventListener('error', (e) => {
	var placeholder = '/assets/ctr/images/placeholder.gif';
	var target = e.target as HTMLElement;
	if (target.tagName === 'IMG' && target.getAttribute('src') !== placeholder) {
		target.setAttribute('src', placeholder);
	}
}, true);

modules.register([
	checkboxModule,
	ctabsModule,
	newPostViewModule,
	yeahButtonModule,
	deleteButtonModule,
	toolbarConfigsModule,
	tabsModule,
	morePostsModule,
	updatesModule,
	postsModule,
	spoilersModule
]);
