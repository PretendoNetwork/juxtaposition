export var classList = {
	contains: function (el: Element, string: string): boolean {
		return el.className.indexOf(string) !== -1;
	},
	add: function (el: Element, string: string): void {
		el.className += ' ' + string;
	},
	remove: function (el: Element, string: string): void {
		el.className = el.className.replace(string, '');
	},
	toggle: function (el: Element, string: string): boolean {
		if (!this.contains(el, string)) {
			this.add(el, string);
			return true;
		} else {
			this.remove(el, string);
			return false;
		}
	}
};
