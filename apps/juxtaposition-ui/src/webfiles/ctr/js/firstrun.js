var experience = 0;
var notifications = false;

function selectExperience(type) {
	document.getElementById('beginner').className = ('tab-button');
	document.getElementById('intermediate').className = ('tab-button');
	document.getElementById('expert').className = ('tab-button');
	switch (type) {
		case 0:
			document.getElementById('beginner').className += ' selected';
			experience = 0;
			break;
		case 1:
			document.getElementById('intermediate').className += ' selected';
			experience = 1;
			break;
		case 2:
			document.getElementById('expert').className += ' selected';
			experience = 2;
			break;
	}
	cave.snd_playSe('SE_OLV_OK');
}
window.selectExperience = selectExperience;

function submitFirstRun() {
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
	var theUrl = '/titles/show/newUser';
	xmlhttp.open('POST', theUrl);
	xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xmlhttp.send(JSON.stringify({ experience: experience, notifications: notifications }));
}
window.submitFirstRun = submitFirstRun;

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

// Copy pasted from juxt.js with a couple changes
function initPostModules() {
	var els = document.querySelectorAll('[data-module-show]');
	if (!els) {
		return;
	}
	for (var i = 0; i < els.length; i++) {
		els[i].addEventListener('click', postModel); // intentionally different than the one from juxt.js
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
			// cave.toolbar_setCallback(1, back);
			// cave.toolbar_setCallback(99, back);
		}
		cave.transition_end();
	}
}

document.addEventListener('DOMContentLoaded', function () {
	initPostModules();
});
