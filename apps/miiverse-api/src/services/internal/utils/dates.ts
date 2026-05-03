import { DateTime } from 'luxon';

export function fixupUnicodes(input: string): string {
	// 202F NARROW NON BREAKING SPACE
	// -> normal NBSP (Cemu doesn't render NNBSP right)
	input = input.replaceAll('\u202F', '\u00A0');

	return input;
}

function makeDateObject(date: Date | DateTime | string): DateTime {
	if (date instanceof Date) {
		date = DateTime.fromJSDate(date);
	} else if (typeof date === 'string') {
		date = DateTime.fromISO(date);
	}

	return date;
}

export function humanDate(date?: Date | DateTime | string | null): string {
	if (!date) {
		return 'null';
	}
	date = makeDateObject(date);

	const dateString = date.toUTC().toLocaleString(DateTime.DATETIME_MED) + ' UTC';
	return fixupUnicodes(dateString);
}
