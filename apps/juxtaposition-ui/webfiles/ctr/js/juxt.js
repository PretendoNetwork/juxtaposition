import './polyfills';

import { initCheckboxes } from './controls/checkbox';
import { initClientTabs } from './controls/ctabs';
import { initNewPostView } from './new-post-view';
import { pjaxBack, pjaxCanGoBack, pjaxHistory, pjaxInit, pjaxLoadUrl, pjaxRefresh } from './pjax';
import { initPostPageView, initYeahButton } from './post';
import { initToolbarConfigs } from './toolbar';
import { classList } from './util';
import { GET, POST } from './xhr';

setInterval(checkForUpdates, 30000);

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
cave.toolbar_setCallback(8, function () { });

function initPostModules() {
	var els = document.querySelectorAll('[data-module-show]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].onclick = postModel;
	}
	function postModel(e) {
		var el = e.currentTarget;
		var show = el.getAttribute('data-module-show');
		var hide = el.getAttribute('data-module-hide');
		var header = el.getAttribute('data-header');
		var sound = el.getAttribute('data-sound');
		var message = el.getAttribute('data-message');

		if (sound) {
			cave.snd_playSe(sound);
		}
		if (!show || !hide) {
			return;
		}
		document.getElementById(hide).style.display = 'none';
		document.getElementById(show).style.display = 'block';
		if (header === 'true') {
			document.getElementById('header').style.display = 'block';
		} else {
			document.getElementById('header').style.display = 'none';
		}
		function tempBk() {
			document.getElementById('close-modal-button').click();
		}
		if (message) {
			cave.toolbar_setWideButtonMessage(message);
			cave.toolbar_setMode(1);
			cave.toolbar_setButtonType(1);
			cave.toolbar_setCallback(1, tempBk);
			cave.toolbar_setCallback(99, tempBk);
			cave.toolbar_setCallback(8, function () {
				cave.toolbar_setMode(0);
				cave.toolbar_setButtonType(0);
				document.getElementById('submit').click();
			});
		} else {
			cave.toolbar_setMode(0);
			cave.toolbar_setButtonType(0);
			cave.toolbar_setCallback(1, back);
			cave.toolbar_setCallback(99, back);
		}
		cave.transition_end();
	}
}
function initMorePosts() {
	var els = document.querySelectorAll('.load-more[data-href]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			cave.snd_playSe('SE_OLV_OK');
			GET(el.getAttribute('data-href'), function a(data) {
				var response = data.responseText;
				if (response && data.status === 200) {
					el.parentElement.outerHTML = response;
					initPosts();
					initMorePosts();
				} else {
					el.parentElement.outerHTML = '';
				}
			});
		});
	}
}
function initPosts() {
	var els = document.querySelectorAll('.post-content[data-href]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			pjaxLoadUrl(e.currentTarget.getAttribute('data-href'), true);
		});
	}
	initYeahButton(document);
	initSpoilers();
}

function initSpoilers() {
	var els = document.querySelectorAll('button[data-post-id]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			classList.remove(
				document.getElementById('post-' + el.getAttribute('data-post-id')),
				'spoiler'
			);
			document.getElementById(
				'spoiler-' + el.getAttribute('data-post-id')
			).outerHTML = '';
			cave.snd_playSe('SE_OLV_OK');
		});
	}
}
function initTabs() {
	var els = document.querySelectorAll('.tab-button');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].onclick = tabs;
	}
	function tabs(e) {
		e.preventDefault();
		cave.transition_begin();
		var el = e.currentTarget;
		var child = el.children[0];

		for (var i = 0; i < els.length; i++) {
			if (classList.contains(els[i], 'selected')) {
				classList.remove(els[i], 'selected');
			}
		}
		classList.add(el, 'selected');

		GET(child.getAttribute('href') + '?pjax=true', function a(data) {
			var response = data.responseText;
			if (response && data.status === 200) {
				document.getElementsByClassName('tab-body')[0].innerHTML = response;
				pjaxHistory.push(child.href);
				initPosts();
				initMorePosts();
				cave.transition_end();
			}
		});
	}
}

function back() {
	if (!pjaxCanGoBack()) {
		cave.toolbar_setButtonType(0);
	} else {
		pjaxBack();
	}
}

function stopLoading() {
	if (window.location.href.indexOf('/titles/show/first') !== -1) {
		return;
	}
	cave.transition_end();
	cave.lls_setItem('agree_olv', '1');
	cave.snd_playBgm('BGM_CAVE_MAIN');
	cave.toolbar_setVisible(true);
}
window.stopLoading = stopLoading;

function initAll() {
	initPosts();
	initMorePosts();
	initPostModules();
	initNewPostView();
	initTabs();
	initPostPageView();
	initClientTabs();
	initCheckboxes();
	checkForUpdates();
	initToolbarConfigs();
	pjaxRefresh();
}

function checkForUpdates() {
	GET('/users/notifications.json', function updates(data) {
		var notificationObj = JSON.parse(data.responseText);
		var count =
			notificationObj.message_count + notificationObj.notification_count;
		cave.toolbar_setNotificationCount(count);
	});
}

function follow(el) {
	var id = el.getAttribute('data-community-id');
	var count = document.getElementById('followers');
	el.disabled = true;
	var params = 'id=' + id;
	if (classList.contains(el, 'selected')) {
		classList.remove(el, 'selected');
		cave.snd_playSe('SE_OLV_CANCEL');
	} else {
		classList.add(el, 'selected');
		cave.snd_playSe('SE_OLV_MII_ADD');
	}

	POST(el.getAttribute('data-url'), params, function a(data) {
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

function saveUserSettings() {
	document.getElementById('submit').click();
}
window.saveUserSettings = saveUserSettings;
function exitUserSettings() {
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
	initAll();
	stopLoading();
});
document.addEventListener('PjaxRequest', function () {
	cave.transition_begin();
});
document.addEventListener('PjaxDone', function () {
	initAll();
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
	var placeholder = '/images/placeholder.gif';
	var target = e.target;
	if (target.tagName === 'IMG' && target.getAttribute('src') !== placeholder) {
		target.setAttribute('src', placeholder);
	}
}, true);
