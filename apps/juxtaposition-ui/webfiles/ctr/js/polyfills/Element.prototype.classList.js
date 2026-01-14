// Element.prototype.classList by Remy Sharp
// updated by thednp

var ClassLIST = function (elem) {
	var classArr = (elem.getAttribute('class') || '').trim().split(/\s+/) || [];

	// methods
	this.contains = function (classNAME) {
		return classArr.indexOf(classNAME) > -1;
	};
	this.add = function (classNAME) {
		if (!this.contains(classNAME)) {
			classArr.push(classNAME);
			elem.setAttribute('class', classArr.join(' '));
		}
	};
	this.remove = function (classNAME) {
		if (this.contains(classNAME)) {
			classArr.splice(classArr.indexOf(classNAME), 1);
			elem.setAttribute('class', classArr.join(' '));
		}
	};
	this.toggle = function (classNAME) {
		if (this.contains(classNAME)) {
			this.remove(classNAME);
		} else {
			this.add(classNAME);
		}
	};
};
Object.defineProperty(Element.prototype, 'classList', {
	get: function () {
		return new ClassLIST(this);
	}
});
