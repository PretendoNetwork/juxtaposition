let pjax;
const updateCheck = setInterval(checkForUpdates, 30000);

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
cave.toolbar_setCallback(8, function () {

});

function initPostModules() {
	const els = document.querySelectorAll('[data-module-show]');
	if (!els) {
		return;
	}
	for (let i = 0; i < els.length; i++) {
		els[i].onclick = postModel;
	}
	function postModel(e) {
		const el = e.currentTarget;
		const show = el.getAttribute('data-module-show');
		const hide = el.getAttribute('data-module-hide');
		const header = el.getAttribute('data-header');
		const sound = el.getAttribute('data-sound');
		const message = el.getAttribute('data-message');
		const screenshot = el.getAttribute('data-screenshot');
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
			const screenshotButton = document.getElementById('screenshot-button');
			if (!cave.capture_isEnabled()) {
				classList.add(screenshotButton, 'none');
				screenshotButton.onclick = null;
			}
		}
		if (message) {
			cave.toolbar_setWideButtonMessage(message);
			cave.toolbar_setMode(1);
			cave.toolbar_setButtonType(1);
			function tempBk() {
				document.getElementById('close-modal-button').click();
			}
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
		initNewPost();
	}
}
function initMorePosts() {
	const els = document.querySelectorAll('.load-more[data-href]');
	if (!els) {
		return;
	}
	for (let i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			const el = e.currentTarget;
			cave.snd_playSe('SE_OLV_OK');
			GET(el.getAttribute('data-href'), function a(data) {
				const response = data.responseText;
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
	const els = document.querySelectorAll('.post-content[data-href]');
	if (!els) {
		return;
	}
	for (let i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			pjax.loadUrl(e.currentTarget.getAttribute('data-href'));
		});
	}
	initYeah();
	initSpoilers();
}
function initYeah() {
	const els = document.querySelectorAll('button[data-post]');
	if (!els) {
		return;
	}
	for (let i = 0; i < els.length; i++) {
		els[i].onclick = yeah;
	}
	function yeah(e) {
		const el = e.currentTarget; const id = el.getAttribute('data-post');
		const parent = document.getElementById(id);
		const count = document.getElementById('count-' + id);
		el.disabled = true;
		const params = 'postID=' + id;
		if (classList.contains(el, 'selected')) {
			classList.remove(el, 'selected');
			classList.remove(parent, 'yeah');
			if (count) {
				count.innerText -= 1;
			}
			cave.snd_playSe('SE_OLV_CANCEL');
		} else {
			classList.add(el, 'selected');
			classList.add(parent, 'yeah');
			if (count) {
				count.innerText = ++count.innerText;
			}
			cave.snd_playSe('SE_OLV_MII_ADD');
		}
		POST('/posts/empathy', params, function a(data) {
			const post = JSON.parse(data.responseText);
			if (!post || post.status !== 200) {
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
	const els = document.querySelectorAll('button[data-post-id]');
	if (!els) {
		return;
	}
	for (let i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			const el = e.currentTarget;
			classList.remove(document.getElementById('post-' + el.getAttribute('data-post-id')), 'spoiler');
			document.getElementById('spoiler-' + el.getAttribute('data-post-id')).outerHTML = '';
			cave.snd_playSe('SE_OLV_OK');
		});
	}
}
function initTabs() {
	const els = document.querySelectorAll('.tab-button');
	if (!els) {
		return;
	}
	for (let i = 0; i < els.length; i++) {
		els[i].onclick = tabs;
	}
	function tabs(e) {
		e.preventDefault();
		cave.transition_begin();
		const el = e.currentTarget;
		const child = el.children[0];

		for (let i = 0; i < els.length; i++) {
			if (classList.contains(els[i], 'selected')) {
				classList.remove(els[i], 'selected');
			}
		}
		classList.add(el, 'selected');

		GET(child.getAttribute('href') + '?pjax=true', function a(data) {
			const response = data.responseText;
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
	cave.toolbar_setActiveButton(3);
	cave.snd_playBgm('BGM_CAVE_MAIN');
	cave.toolbar_setVisible(true);
}

function initAll() {
	initPosts();
	initMorePosts();
	initPostModules();
	initTabs();
	checkForUpdates();
	pjax.refresh();
}

var PostStorage = {
	maxLocalStorageNum: 3,
	getPosts: function () {
		return PostStorage.getAll()[0];
	},
	getAll: function () {
		for (var e = {}, t = cave.lls_getCount(), i = new RegExp('^[0-9]+$'), o = 0, n = 0; n < t; n++) {
			const a = cave.lls_getKeyAt(n);
			i.test(a) && (e[a] = cave.lls_getItem(a), o += 1);
		}
		return [e, o];
	},
	getCount: function () {
		return PostStorage.getAll()[1];
	},
	setItem: function (e) {
		const t = (new Date()).getTime();
		cave.lls_setItem(String(t), e);
	},
	removeItem: function (e) {
		const t = JSON.parse(cave.lls_getItem(e));
		t && t.screenShotKey && cave.lls_removeItem(t.screenShotKey), cave.lls_removeItem(e);
	},
	hasKey: function (e) {
		for (let t = cave.lls_getCount(), i = 0; i < t; i++) {
			if (e === cave.lls_getKeyAt(i)) {
				return !0;
			}
		}
		return !1;
	},
	sweep: function () {
		const t = PostStorage.getAll();
		const i = t[0];
		if (t[1] > 0) {
			for (const o in i) {
				const n = JSON.parse(cave.lls_getItem(o)).screenShotKey;
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
function testOffline() {
	const posts = PostStorage.getAll();
	const text = JSON.stringify(posts, null, '\t');
	POST('/test', text, function () {
		window.alert('sent');
	});
}

function checkForUpdates() {
	GET('/notifications.json', function updates(data) {
		const notificationObj = JSON.parse(data.responseText);
		const count = notificationObj.message_count + notificationObj.notification_count;
		cave.toolbar_setNotificationCount(count);
	});
}

function newText() {
	classList.remove(document.getElementById('memo-sprite'), 'selected');
	classList.remove(document.getElementById('post-memo'), 'selected');
	classList.add(document.getElementById('text-sprite'), 'selected');
	classList.add(document.getElementById('post-text'), 'selected');
}
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
			document.getElementById('memo').src = 'data:image/png;base64,' + cave.memo_getImageBmp();
			document.getElementById('memo-value').value = cave.memo_getImageBmp();
		}
	}, 250);
}

function newScreenshot(topScreen) {
	const screenshot = topScreen ? cave.capture_getLowerImage() : null;
}

function follow(el) {
	const id = el.getAttribute('data-community-id');
	const count = document.getElementById('followers');
	el.disabled = true;
	const params = 'id=' + id;
	if (classList.contains(el, 'selected')) {
		classList.remove(el, 'selected');
		cave.snd_playSe('SE_OLV_CANCEL');
	} else {
		classList.add(el, 'selected');
		cave.snd_playSe('SE_OLV_MII_ADD');
	}

	POST(el.getAttribute('data-url'), params, function a(data) {
		const element = JSON.parse(data.responseText);
		if (!element || element.status !== 200) {
			// Apparently there was an actual error code for not being able to yeah a post, who knew!
			// TODO: Find more of these
			return cave.error_callErrorViewer(155927);
		}
		el.disabled = false;
		count.innerText = element.count;
	});
}

function POST(url, data, callback) {
	cave.transition_begin();
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4) {
			cave.transition_end();
			return callback(this);
		}
	};
	xhttp.open('POST', url, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send(data);
}
function GET(url, callback) {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4) {
			return callback(this);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}
document.addEventListener('DOMContentLoaded', function () {
	pjax = Pjax.init({
		elements: 'a[data-pjax]',
		selectors: ['title', '#body']
	});
	console.debug('Pjax initialized.', pjax);
	initAll();
	stopLoading();
});
document.addEventListener('PjaxRequest', function (e) {
	console.log(e);
	cave.transition_begin();
});
document.addEventListener('PjaxLoaded', function (e) {
	console.log(e);
});
document.addEventListener('PjaxDone', function (e) {
	initAll();
	cave.brw_scrollImmediately(0, 0);
	if (pjax.canGoBack()) {
		cave.toolbar_setButtonType(1);
	} else {
		cave.toolbar_setButtonType(0);
	}
	cave.transition_end();
});
