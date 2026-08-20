export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'] as const;

export function startOfWeek(date = new Date()): Date {
	const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const offset = (result.getDay() + 6) % 7;
	result.setDate(result.getDate() - offset);
	return result;
}

export function toWeekKey(date: Date): string {
	const monday = startOfWeek(date);
	const month = `${monday.getMonth() + 1}`.padStart(2, '0');
	const day = `${monday.getDate()}`.padStart(2, '0');
	return `${monday.getFullYear()}-${month}-${day}`;
}

export function shiftWeek(weekKey: string, weeks: number): string {
	const [year, month, day] = weekKey.split('-').map(Number);
	const date = new Date(year, month - 1, day + weeks * 7);
	return toWeekKey(date);
}

export function weekDates(weekKey: string): Date[] {
	const [year, month, day] = weekKey.split('-').map(Number);
	return WEEK_DAYS.map((_, index) => new Date(year, month - 1, day + index));
}

export function formatWeekRange(weekKey: string): string {
	const dates = weekDates(weekKey);
	const formatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
	return `${formatter.format(dates[0])} – ${formatter.format(dates[6])}, ${dates[6].getFullYear()}`;
}

export function formatDay(date: Date): string {
	return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
}

export function isToday(date: Date): boolean {
	const now = new Date();
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth() &&
		date.getDate() === now.getDate()
	);
}
