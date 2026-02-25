import type CaveAPI from '@pretendonetwork/cave-types/cave';

var toolbar: HTMLDivElement;
var buttons: Record<number, HTMLDivElement> = {};

var	BACK = 1;
var	ACTIVITY = 2;
var COMMUNITIES = 3;
var NOTIFICATIONS = 4;
var MY_MENU = 5;
var GUIDE = 7;
var MESSAGE = 8;
var BACK_KEY = 99;

export var caveFuncs: Partial<CaveAPI> = {
	toolbar_setCallback: (button, callback) => {
		buttons[button].onclick = callback;
	},
	toolbar_setButtonType: (button) => {
		buttons[BACK].innerText = button ? 'Back' : 'Exit';
	},
	toolbar_setVisible: (flag) => {
		toolbar.hidden = !flag;
	},
	toolbar_setActiveButton: (button) => {
		for (var b in buttons) {
			buttons[b].style.background = 'lightgray';
		}
		buttons[button as number].style.background = 'lightblue';
	},
	toolbar_setNotificationCount: (count) => {
		buttons[NOTIFICATIONS].innerText = count.toString();
	},
	toolbar_setMode: (mode) => {
		buttons[MESSAGE].style.display = mode ? 'inline-block' : 'none';
	},
	toolbar_setWideButtonMessage: (message) => {
		buttons[MESSAGE].innerText = message;
	}
};

export function initDebugToolbar(): void {
	toolbar = document.createElement('div');
	toolbar.id = 'debug-toolbar';
	toolbar.style.width = '320px';
	toolbar.style.height = '28px';

	toolbar.style.position = 'fixed';
	toolbar.style.top = `${220 + 212}px`;
	toolbar.style.left = '40px';
	toolbar.style.zIndex = '100000';

	var names = [
		{ num: BACK, name: 'Exit' },
		{ num: MY_MENU, name: 'Me' },
		{ num: ACTIVITY, name: 'Feed' },
		{ num: COMMUNITIES, name: 'Comm' },
		{ num: NOTIFICATIONS, name: 'Notif' }
	];

	names.forEach((obj) => {
		var num = obj.num;
		var name = obj.name;

		var button = createButton(64);
		button.id = `debug-${name}`;
		button.innerText = name;

		toolbar.appendChild(button);
		buttons[num] = button;
	});

	var messageButton = createButton(256);
	messageButton.id = `debug-MESSAGE`;
	messageButton.style.position = 'absolute';
	messageButton.style.left = '64px';
	messageButton.style.top = '0';

	messageButton.style.display = 'none';

	toolbar.appendChild(messageButton);
	buttons[MESSAGE] = messageButton;

	var dummy = createButton(0);
	buttons[GUIDE] = dummy;
	buttons[BACK_KEY] = dummy;

	window.addEventListener('DOMContentLoaded', () => {
		document.body.appendChild(toolbar);
	});
}

function createButton(width: number): HTMLDivElement {
	var b = document.createElement('div');
	b.style.width = `${width}px`;
	b.style.height = '28px';

	b.style.display = 'inline-block';
	b.style.boxSizing = 'border-box';
	b.style.webkitBoxSizing = 'border-box';
	b.style.overflow = 'hidden';

	b.style.background = 'lightgray';
	b.style.border = '0 solid gray';
	b.style.borderWidth = '1px 1px 0 0';

	return b;
}
