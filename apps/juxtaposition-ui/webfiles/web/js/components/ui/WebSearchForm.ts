function prepSearchTerm(term: string): string {
	const removeChars = /\W/g;
	return term
		.toLowerCase()
		.normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
		.replace(removeChars, '');
}

function searchChanged(this: HTMLInputElement): void {
	const list = document.querySelector(this.getAttribute('data-community-list-search')!)!;
	const searchTerm = prepSearchTerm(this.value);

	list.querySelectorAll<HTMLElement>('[data-search-term]').forEach((item) => {
		const term = item.getAttribute('data-search-term')!;

		if (term.includes(searchTerm)) {
			item.style.display = '';
		} else {
			item.style.display = 'none';
		}
	});
}

export function initSearchForm(): void {
	document.querySelectorAll<HTMLInputElement>('[data-community-list-search]').forEach((el) => {
		el.addEventListener('input', searchChanged);
	});
}
