import './polyfills';
import { Pjax } from './pjax';
import { GET, POST } from './xhr';
import { initPostPageView } from './post';
import { empathyPostById } from './api';

var pjax;
setInterval(checkForUpdates, 30000);

cave.toolbar_setCallback(1, back);
cave.toolbar_setCallback(99, back);
cave.toolbar_setCallback(2, function () {
	cave.toolbar_setActiveButton(2);
	pjax.loadUrl('/feed');
});
cave.toolbar_setCallback(3, function () {
	cave.toolbar_setActiveButton(3);
	pjax.loadUrl('/titles');
});
cave.toolbar_setCallback(4, function () {
	cave.toolbar_setActiveButton(4);
	checkForUpdates();
	pjax.loadUrl('/news/my_news');
});
cave.toolbar_setCallback(5, function () {
	cave.toolbar_setActiveButton(5);
	pjax.loadUrl('/users/me');
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
		var screenshot = el.getAttribute('data-screenshot');

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
		if (screenshot) {
			var screenshotButton = document.getElementById('screenshot-button');
			if (!cave.capture_isEnabled()) {
				classList.add(screenshotButton, 'none');
				screenshotButton.onclick = null;
			}
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
			pjax.loadUrl(e.currentTarget.getAttribute('data-href'));
		});
	}
	initYeah();
	initSpoilers();
}
function initYeah() {
	var els = document.querySelectorAll('button[data-post]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].onclick = yeah;
	}
	function yeah(e) {
		var el = e.currentTarget;
		var sprite = el.querySelector('.sprite.sp-yeah');
		var id = el.getAttribute('data-post');
		var parent = document.getElementById(id);
		var count = document.getElementById('count-' + id);
		el.disabled = true;
		if (classList.contains(el, 'selected')) {
			classList.remove(el, 'selected');
			classList.remove(sprite, 'selected');
			classList.remove(parent, 'yeah');
			if (count) {
				count.innerText -= 1;
			}
			cave.snd_playSe('SE_OLV_CANCEL');
		} else {
			classList.add(el, 'selected');
			classList.add(sprite, 'selected');
			classList.add(parent, 'yeah');
			if (count) {
				count.innerText = ++count.innerText;
			}
			cave.snd_playSe('SE_OLV_MII_ADD');
		}
		empathyPostById(id, function (post) {
			if (post.status !== 200) {
				// Apparently there was an actual error code for not being able to yeah a post, who knew!
				// TODO: Find more of these
				return cave.error_callErrorViewer(155927);
			}
			el.disabled = false;
			if (count) {
				count.innerText = post.count;
			}
		});
	}
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
				pjax.history.push(child.href);
				initPosts();
				initMorePosts();
				cave.transition_end();
			}
		});
	}
}
function initToolbarConfigs() {
	var toolbarConfig = document.querySelector('[data-toolbar-config]');
	if (!toolbarConfig) {
		return;
	}
	var mode = toolbarConfig.getAttribute('data-toolbar-mode');
	var message = toolbarConfig.getAttribute('data-toolbar-message');
	var clickHandle = toolbarConfig.getAttribute('data-toolbar-onclick');
	var backHandle = toolbarConfig.getAttribute('data-toolbar-onback');
	var activeButton = toolbarConfig.getAttribute('data-toolbar-active-button');
	var backgroundMusic = toolbarConfig.getAttribute('data-toolbar-bgm');
	var backgroundMusicExit = toolbarConfig.getAttribute('data-toolbar-exit-bgm');
	var sound = toolbarConfig.getAttribute('data-toolbar-sound');

	if (mode) {
		cave.toolbar_setMode(parseInt(mode));
	}

	if (message) {
		cave.toolbar_setWideButtonMessage(message);
	}

	if (clickHandle) {
		cave.toolbar_setCallback(8, function () {
			cave.toolbar_setMode(0);
			cave.toolbar_setButtonType(0);
			if (backgroundMusicExit) {
				cave.snd_playBgm(backgroundMusicExit);
			}
			eval(window[clickHandle]).call();
		});
	}

	if (backHandle) {
		function goBackHandle() {
			cave.toolbar_setMode(0);
			cave.toolbar_setButtonType(0);
			if (backgroundMusicExit) {
				cave.snd_playBgm(backgroundMusicExit);
			}
			eval(window[backHandle]).call();
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

function reportPost(post) {
	var id = post.getAttribute('data-post');
	var button = document.getElementById('report-launcher');
	var form = document.getElementById('report-form');
	var formID = document.getElementById('report-post-id');
	if (!id || !button || !form || !formID) {
		return;
	}

	form.action = '/posts/' + id + '/report';
	formID.value = id;
	button.click();
}
window.reportPost = reportPost;

function back() {
	if (!pjax.canGoBack()) {
		cave.toolbar_setButtonType(0);
	} else {
		pjax.back();
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
	initTabs();
	initPostPageView();
	checkForUpdates();
	initToolbarConfigs();
	pjax.refresh();
}

var PostStorage = {
	maxLocalStorageNum: 3,
	getPosts: function () {
		return PostStorage.getAll()[0];
	},
	getAll: function () {
		for (
			var e = {},
				t = cave.lls_getCount(),
				i = new RegExp('^[0-9]+$'),
				o = 0,
				n = 0;
			n < t;
			n++
		) {
			var a = cave.lls_getKeyAt(n);
			i.test(a) && ((e[a] = cave.lls_getItem(a)), (o += 1));
		}
		return [e, o];
	},
	getCount: function () {
		return PostStorage.getAll()[1];
	},
	setItem: function (e) {
		var t = new Date().getTime();
		cave.lls_setItem(String(t), e);
	},
	removeItem: function (e) {
		var t = JSON.parse(cave.lls_getItem(e));
		t && t.screenShotKey && cave.lls_removeItem(t.screenShotKey),
		cave.lls_removeItem(e);
	},
	hasKey: function (e) {
		for (var t = cave.lls_getCount(), i = 0; i < t; i++) {
			if (e === cave.lls_getKeyAt(i)) {
				return !0;
			}
		}
		return !1;
	},
	sweep: function () {
		var t = PostStorage.getAll();
		var i = t[0];
		if (t[1] > 0) {
			for (var o in i) {
				var n = JSON.parse(cave.lls_getItem(o)).screenShotKey;
				n && !PostStorage.hasKey(n) && cave.lls_removeItem(o);
			}
		}
	}
};

var classList = {
	contains: function (el, string) {
		return el.className.indexOf(string) !== -1;
	},
	add: function (el, string) {
		el.className += ' ' + string;
	},
	remove: function (el, string) {
		el.className = el.className.replace(string, '');
	}
};

function checkForUpdates() {
	GET('/users/notifications.json', function updates(data) {
		var notificationObj = JSON.parse(data.responseText);
		var count =
			notificationObj.message_count + notificationObj.notification_count;
		cave.toolbar_setNotificationCount(count);
	});
}

function newText() {
	classList.remove(document.getElementById('memo-sprite'), 'selected');
	classList.remove(document.getElementById('post-memo'), 'selected');
	classList.add(document.getElementById('text-sprite'), 'selected');
	classList.add(document.getElementById('post-text'), 'selected');
}
window.newText = newText;

function newPainting(reset) {
	if (reset) {
		cave.memo_clear();
	}
	classList.remove(document.getElementById('text-sprite'), 'selected');
	classList.remove(document.getElementById('post-text'), 'selected');
	classList.add(document.getElementById('memo-sprite'), 'selected');
	classList.add(document.getElementById('post-memo'), 'selected');
	cave.memo_open();
	setTimeout(function () {
		if (cave.memo_hasValidImage()) {
			document.getElementById('memo').src =
				'data:image/png;base64,' + cave.memo_getImageBmp();
			document.getElementById('memo-value').value = cave.memo_getImageBmp();
		}
	}, 250);
}
window.newPainting = newPainting;

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
	pjax.loadUrl('/users/me');
	cave.toolbar_setButtonType(1);
}
window.exitUserSettings = exitUserSettings;

document.addEventListener('DOMContentLoaded', function () {
	pjax = Pjax.init({
		elements: 'a[data-pjax]',
		selectors: ['title', '#body']
	});
	console.debug('Pjax initialized.', pjax);
	initAll();
	stopLoading();
});
document.addEventListener('PjaxRequest', function (_e) {
	// console.log(e);
	cave.transition_begin();
});
document.addEventListener('PjaxLoaded', function (_e) {
	// console.log(e);
});
document.addEventListener('PjaxDone', function (_e) {
	initAll();
	cave.brw_scrollImmediately(0, 0);
	if (pjax.canGoBack()) {
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
