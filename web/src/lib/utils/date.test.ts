import { describe, expect, it } from 'vitest';
import { formatWeekRange, shiftWeek, startOfWeek, toWeekKey, weekDates } from '$lib/utils/date';

describe('startOfWeek', () => {
	it('returns the Monday of the containing week', () => {
		expect(startOfWeek(new Date(2026, 7, 20)).getDate()).toBe(17);
	});

	it('treats Sunday as the last day of the week', () => {
		expect(startOfWeek(new Date(2026, 7, 23)).getDate()).toBe(17);
	});
});

describe('toWeekKey', () => {
	it('formats the Monday as a zero padded key', () => {
		expect(toWeekKey(new Date(2026, 0, 8))).toBe('2026-01-05');
	});
});

describe('shiftWeek', () => {
	it('moves forwards and backwards across month boundaries', () => {
		expect(shiftWeek('2026-08-31', 1)).toBe('2026-09-07');
		expect(shiftWeek('2026-01-05', -1)).toBe('2025-12-29');
	});
});

describe('weekDates', () => {
	it('produces seven consecutive days starting on Monday', () => {
		const dates = weekDates('2026-08-17');

		expect(dates).toHaveLength(7);
		expect(dates[0].getDay()).toBe(1);
		expect(dates[6].getDate()).toBe(23);
	});
});

describe('formatWeekRange', () => {
	it('renders a readable range for the week', () => {
		expect(formatWeekRange('2026-08-17')).toBe('17 Aug – 23 Aug, 2026');
	});
});
