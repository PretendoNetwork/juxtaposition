var experience = 0;
var notifications = false;

function selectExperience(type) {
	document.getElementById('beginner').classList.remove('selected');
	document.getElementById('intermediate').classList.remove('selected');
	document.getElementById('expert').classList.remove('selected');
	switch (type) {
		case 0:
			document.getElementById('beginner').classList.add('selected');
			experience = 0;
			break;
		case 1:
			document.getElementById('intermediate').classList.add('selected');
			experience = 1;
			break;
		case 2:
			document.getElementById('expert').classList.add('selected');
			experience = 2;
			break;
	}
	wiiuSound.playSoundByName('SE_OLV_OK', 1);
}
window.selectExperience = selectExperience;

function firstRunSubmit() {
	var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
	var theUrl = '/titles/show/newUser';
	xmlhttp.open('POST', theUrl);
	xmlhttp.onreadystatechange = function () {
		if (this.readyState === 4 && (this.status === 423 || this.status === 404 || this.status === 504)) {
			wiiuErrorViewer.openByCodeAndMessage(5986000 + this.status, 'Unable to complete setup, the server is likely having issues.\n\nPlease try again later.');
			wiiuBrowser.closeApplication();
		}
	};
	xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	xmlhttp.send(JSON.stringify({ experience: experience, notifications: notifications }));
	wiiuSound.playSoundByName('JGL_OLV_INIT_END', 3);
}
window.firstRunSubmit = firstRunSubmit;
