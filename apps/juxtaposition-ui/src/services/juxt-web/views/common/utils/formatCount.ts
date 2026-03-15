/**
 * Abbreviates large numbers for display.
 * Examples: 999 → "999", 1000 → "1K", 22493 → "22.5K", 1500000 → "1.5M"
 */
export function abbreviateCount(count: number): string {
	if (count >= 1_000_000) {
		const formatted = (count / 1_000_000).toFixed(1).replace(/\.0$/, '');
		return `${formatted}M`;
	}
	if (count >= 1_000) {
		const formatted = (count / 1_000).toFixed(1).replace(/\.0$/, '');
		return `${formatted}K`;
	}
	return count.toString();
}
