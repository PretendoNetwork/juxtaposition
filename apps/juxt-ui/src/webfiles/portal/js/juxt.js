var pjax;
setInterval(checkForUpdates, 30000);
setInterval(input, 100);

function initNavBar() {
	var els = document.querySelectorAll('#nav-menu > li[data-tab]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			for (var i = 0; i < els.length; i++) {
				if (els[i].classList.contains('selected')) {
					els[i].classList.remove('selected');
				}
			}
			el.classList.add('selected');
		});
	}
}
function initYeah() {
	var els = document.querySelectorAll('button[data-post].yeah-button');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].removeEventListener('click', yeah);
		els[i].addEventListener('click', yeah);
	}
	function yeah(e) {
		var el = e.currentTarget;
		var id = el.getAttribute('data-post');
		var parent = document.getElementById(id);
		var count = document.getElementById('count-' + id);
		el.disabled = true;
		var params = 'postID=' + id;
		if (el.classList.contains('selected')) {
			el.classList.remove('selected');
			parent.classList.remove('yeah');
			if (count) {
				count.innerText -= 1;
			}
			wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
		} else {
			el.classList.add('selected');
			parent.classList.add('yeah');
			if (count) {
				count.innerText = ++count.innerText;
			}
			wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
		}

		POST('/posts/empathy', params, function a(data) {
			var post = JSON.parse(data.response);
			if (!post || post.status !== 200) {
				// Apparently there was an actual error code for not being able to yeah a post, who knew!
				// TODO: Find more of these
				return wiiuErrorViewer.openByCode(1155927);
			}
			el.disabled = false;
			if (count) {
				count.innerText = post.count;
			}
		});
	}
}
function initTabs() {
	var els = document.querySelectorAll('.tab-button');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].removeEventListener('click', tabs);
		els[i].addEventListener('click', tabs);
	}
	function tabs(e) {
		e.preventDefault();
		var el = e.currentTarget;
		var child = el.children[0];

		for (var i = 0; i < els.length; i++) {
			if (els[i].classList.contains('selected')) {
				els[i].classList.remove('selected');
			}
		}
		el.classList.add('selected');

		GET(child.getAttribute('href') + '?pjax=true', function a(data) {
			var response = data.response;
			if (response && data.status === 200) {
				document.getElementsByClassName('tab-body')[0].innerHTML = data.response;
				window.history.pushState({ url: child.href, title: '', scrollPos: [0, 0] }, '', child.href);
				initPosts();
				initMorePosts();
			}
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
function initMorePosts() {
	var els = document.querySelectorAll('.load-more[data-href]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			GET(el.getAttribute('data-href'), function a(data) {
				var response = data.response;
				if (response && data.status === 200) {
					el.parentElement.outerHTML = data.response;
					initPosts();
					initMorePosts();
				} else {
					el.parentElement.outerHTML = '';
				}
			});
		});
	}
}
function initPostModules() {
	var els = document.querySelectorAll('[data-module-show]');
	console.log(els);
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			var show = el.getAttribute('data-module-show');
			var hide = el.getAttribute('data-module-hide');
			if (!show || !hide) {
				return;
			}
			document.getElementById(hide).style.display = 'none';
			document.getElementById(show).style.display = 'block';

			var header = el.getAttribute('data-header');
			var menu = el.getAttribute('data-menu');
			var sound = el.getAttribute('data-sound');
			if (sound) {
				wiiuSound.playSoundByName(sound, 3);
			}

			if (header === 'true') {
				document.getElementById('header').style.display = 'block';
			} else {
				document.getElementById('header').style.display = 'none';
			}
			if (menu === 'true') {
				document.getElementById('nav-menu').style.display = 'block';
			} else {
				document.getElementById('nav-menu').style.display = 'none';
			}
			wiiuBrowser.showLoadingIcon(false);
			initNewPost();
		});
	}
}
function initPostEmotion() {
	var els = document.querySelectorAll('input[data-mii-face-url]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			document.getElementById('mii-face').src = el.getAttribute('data-mii-face-url');
			wiiuSound.playSoundByName(el.getAttribute('data-sound'), 3);
		});
	}
}
function initSounds() {
	var els = document.querySelectorAll('[data-sound]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', playSound);
	}
	function playSound(e) {
		wiiuSound.playSoundByName(e.currentTarget.getAttribute('data-sound'), 3);
	}
}
function initScreenShots() {
	document.getElementById('top-screen').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(true);
	document.getElementById('bottom-screen').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(false);
}
function initNewPost() {
	initPostEmotion();
	initScreenShots();
}
function initSpoilers() {
	var els = document.querySelectorAll('button[data-post-id]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', function (e) {
			var el = e.currentTarget;
			document.getElementById('post-' + el.getAttribute('data-post-id')).classList.remove('spoiler');
			el.outerHTML = '';
		});
	}
}

function initAll() {
	initNavBar();
	initTabs();
	initPosts();
	initMorePosts();
	initPostModules();
	initSounds();
	checkForUpdates();
	pjax.refresh();
}

console.debug('Document initialized:' + window.location.href);
document.addEventListener('pjax:send', function () {
	console.debug('Event: pjax:send', arguments);
	wiiuBrowser.showLoadingIcon(true);
});
document.addEventListener('pjax:complete', function () {
	console.debug('Event: pjax:complete', arguments);
	wiiuBrowser.showLoadingIcon(false);
});
document.addEventListener('pjax:error', function (e) {
	wiiuErrorViewer.openByCodeAndMessage(5984000, 'Error: Unable to load element. \nPlease send the error code and what you were doing in #support');
	console.debug(e);
	wiiuBrowser.showLoadingIcon(false);
});
document.addEventListener('pjax:success', function () {
	console.debug('Event: pjax:success', arguments);
	wiiuBrowser.showLoadingIcon(false);
	var back = document.getElementById('nav-menu-back');
	var close = document.getElementById('nav-menu-exit');
	if (wiiuBrowser.canHistoryBack()) {
		back.classList.remove('selected');
		back.classList.remove('none');
		close.classList.add('none');
	} else {
		back.classList.remove('selected');
		back.classList.add('none');
		close.classList.remove('none');
	}
	initAll();
});
document.addEventListener('DOMContentLoaded', function () {
	pjax = new Pjax({
		elements: 'a[data-pjax]' +
			'',
		selectors: ['title', '#body'],
		switches: { '#nav-menu': Pjax.switches.replaceNode, '.tab-body': Pjax.switches.replaceNode }
	});
	console.debug('Pjax initialized.', pjax);
	initAll();
	stopLoading();
});

function hideScreenShots() {
	document.getElementById('screenshot-toggle').checked = false;
}

// eslint-disable-next-line no-unused-vars -- Used by src/webfiles/portal/partials/new_post.ejs
function chooseScreenShot(value) {
	var screenshot = document.getElementById('screenshot-value');
	switch (value) {
		case 0:
			screenshot.value = wiiuMainApplication.getScreenShot(true);
			document.getElementById('screenshot-value').disabled = false;
			break;
		case 1:
			screenshot.value = wiiuMainApplication.getScreenShot(false);
			document.getElementById('screenshot-value').disabled = false;
			break;
		default:
			screenshot.value = '';
			document.getElementById('screenshot-value').disabled = true;
	}
	hideScreenShots();
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/portal/community.ejs and src/webfiles/portal/user_page.ejs
function follow(el) {
	var id = el.getAttribute('data-community-id');
	var count = document.getElementById('followers');
	el.disabled = true;
	var params = 'id=' + id;
	if (el.classList.contains('checked')) {
		el.classList.remove('checked');
		wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
	} else {
		el.classList.add('checked');
		wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
	}

	POST(el.getAttribute('data-url'), params, function a(data) {
		var element = JSON.parse(data.response);
		if (!element || element.status !== 200) {
			// Apparently there was an actual error code for not being able to yeah a post, who knew!
			// TODO: Find more of these
			return wiiuErrorViewer.openByCode(1155927);
		}
		el.disabled = false;
		count.innerText = element.count;
	});
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/portal/partials/new_post.ejs
function newPainting(reset) {
	wiiuMemo.open(reset);
	setTimeout(function () {
		if (wiiuMemo.isFinish()) {
			console.log('running!');
			document.getElementById('memo').src = 'data:image/png;base64,' + wiiuMemo.getImage(false);
			document.getElementById('memo-value').value = wiiuMemo.getImage(true);
		}
	}, 250);
}
function stopLoading() {
	if (typeof wiiuBrowser !== 'undefined' &&
		typeof wiiuBrowser.endStartUp !== 'undefined') {
		wiiuBrowser.endStartUp();
		wiiuSound.playSoundByName('BGM_OLV_MAIN', 3);
		setTimeout(function () {
			wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
		}, 90000);
		wiiuBrowser.lockUserOperation(false);
	}
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/portal/partials/nav_bar.ejs
function exit() {
	wiiu.gamepad.update();

	if (wiiu.gamepad.hold === 8192 || wiiu.gamepad.hold === 40960) {
		alert('Debug Menu');
	} else {
		wiiuSound.playSoundByName('SE_WAVE_EXIT', 1);
		wiiuBrowser.closeApplication();
	}
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/portal/partials/post_template.ejs
function deletePost(post) {
	var id = post.getAttribute('data-post');
	if (!id) {
		return;
	}
	var confirm = wiiuDialog.confirm('Are you sure you want to delete your post? This cannot be undone.', 'No', 'Yes');
	if (confirm) {
		DELETE('/posts/' + id, function a(data) {
			if (!data || data.status !== 200) {
				return wiiuErrorViewer.openByCodeAndMessage('5980030', 'Post was not able to be deleted. Please try again later.');
			}
			console.log(data);
			alert('Post has been deleted.');
			return window.location.href = data.responseText;
		});
	}
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/portal/partials/post_template.ejs
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
	console.log(id.replace(/(\d{3})(\d{4})(\d{3})(\d{4})(\d{3})(\d{4})/, '$1-$2-$3-$4-$5-$6'));
	button.click();
}
function checkForUpdates() {
	GET('/users/notifications.json', function updates(data) {
		var notificationObj = JSON.parse(data.responseText);
		var messages = document.getElementById('message-badge');
		var news = document.getElementById('news-badge');

		/**/
		if (notificationObj.message_count > 0 && notificationObj.message_count < 99) {
			messages.innerHTML = notificationObj.message_count;
			messages.style.display = 'block';
		} else if (notificationObj.message_count >= 99) {
			messages.innerHTML = '99+';
			messages.style.display = 'block';
		} else {
			messages.innerHTML = '';
			messages.style.display = 'none';
		}
		if (notificationObj.notification_count > 0 && notificationObj.notification_count < 99) {
			news.innerHTML = notificationObj.notification_count;
			news.style.display = 'block';
		} else if (notificationObj.notification_count >= 99) {
			news.innerHTML = '99+';
			news.style.display = 'block';
		} else {
			news.innerHTML = '';
			news.style.display = 'none';
		}
	});
}
function POST(url, data, callback) {
	wiiuBrowser.showLoadingIcon(true);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4) {
			wiiuBrowser.showLoadingIcon(false);
			return callback(this);
		}
	};
	xhttp.open('POST', url, true);
	xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhttp.send(data);
}
function GET(url, callback) {
	wiiuBrowser.showLoadingIcon(true);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4) {
			wiiuBrowser.showLoadingIcon(false);
			return callback(this);
		}
	};
	xhttp.open('GET', url, true);
	xhttp.send();
}

function DELETE(url, callback) {
	wiiuBrowser.showLoadingIcon(true);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState === 4) {
			wiiuBrowser.showLoadingIcon(false);
			return callback(this);
		}
	};
	xhttp.open('DELETE', url, true);
	xhttp.send();
}

function back() {
	if (wiiuBrowser.canHistoryBack()) {
		document.getElementById('nav-menu-back').classList.add('selected');
		wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
		history.back();
		document.getElementById('nav-menu').style.display = 'block';
	}
}

function input() {
	wiiu.gamepad.update();
	if (wiiu.gamepad.isDataValid === 0) {
		return;
	}
	switch (wiiu.gamepad.hold) {
		case 12:
			return wiiuBrowser.lockUserOperation(false);
		case 4096:
			wiiuSound.playSoundByName('SE_WAVE_BALLOON_OPEN', 1);
			return location.reload();
		case 16384:
			back();
	}
}
