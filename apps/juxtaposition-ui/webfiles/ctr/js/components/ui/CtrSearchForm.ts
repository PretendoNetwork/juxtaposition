function prepSearchTerm(term: string): string {
	var removeChars = /\W/g;
	return term.toLowerCase().replace(removeChars, '');
}

function searchChanged(el: HTMLInputElement): void {
	var list = document.querySelector(el.getAttribute('data-community-list-search')!)!;
	var searchTerm = prepSearchTerm(el.value);

	list.querySelectorAll<HTMLElement>('[data-search-term]').forEach((item) => {
		var term = item.getAttribute('data-search-term')!;

		if (term.includes(searchTerm)) {
			item.style.display = '';
		} else {
			item.style.display = 'none';
		}
	});
}

export function initSearchForm(): void {
	// https://stackoverflow.com/questions/1948332/#comment25346117_1949416
	// Thanks, Johan!
	document.querySelectorAll<HTMLInputElement>('[data-community-list-search]').forEach((el) => {
		var interval = setInterval(() => {
			// Cancel everything if we navigate away (limit memory leaky)
			if (!document.body.contains(el)) {
				clearInterval(interval);
				return;
			}

			// If it changed since last check, do the search
			var val = el.getAttribute('data-last-value');
			if (val != el.value) {
				searchChanged(el);
				el.setAttribute('data-last-value', el.value);
			}
		}, 100);
	});
}
