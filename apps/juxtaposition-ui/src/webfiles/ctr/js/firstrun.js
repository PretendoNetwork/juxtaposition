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
