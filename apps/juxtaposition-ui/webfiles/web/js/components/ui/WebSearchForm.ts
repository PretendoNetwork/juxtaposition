function prepSearchTerm(term: string): string {
	const removeChars = /\W/g;
	// é for Pokémon
	return term.toLowerCase().replace('é', 'e').replace(removeChars, '');
}

function searchChanged(this: HTMLInputElement): void {
	const list = document.querySelector(this.getAttribute('data-community-list-search')!)!;
	const searchTerm = prepSearchTerm(this.value);

	list.querySelectorAll<HTMLElement>('[data-search-term]').forEach((item) => {
		const term = prepSearchTerm(item.getAttribute('data-search-term')!);

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
