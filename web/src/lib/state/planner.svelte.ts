import type { MealSlot, PlannedMeal, RecipeSummary, WeekPlan } from '$lib/types';
import { MEAL_SLOTS, shiftWeek, toWeekKey } from '$lib/utils/date';
import { isRecord, onExternalChange, readStorage, writeStorage } from './storage.svelte';

const STORAGE_KEY = 'rf:meal-plan';

type PlanArchive = Record<string, WeekPlan>;

function isPlanArchive(value: unknown): value is PlanArchive {
	return isRecord(value) && Object.values(value).every(isRecord);
}

function emptyWeek(): WeekPlan {
	return Object.fromEntries(Array.from({ length: 7 }, (_, index) => [String(index), {}]));
}

class PlannerStore {
	weeks = $state<PlanArchive>({});
	weekKey = $state(toWeekKey(new Date()));

	constructor() {
		this.weeks = this.load();
		onExternalChange(STORAGE_KEY, () => (this.weeks = this.load()));
	}

	private load() {
		return readStorage(STORAGE_KEY, {} as PlanArchive, isPlanArchive);
	}

	get currentWeek(): WeekPlan {
		return this.weeks[this.weekKey] ?? emptyWeek();
	}

	get plannedCount(): number {
		return Object.values(this.currentWeek).reduce((total, day) => total + Object.keys(day).length, 0);
	}

	get totalPlannedCount(): number {
		return Object.values(this.weeks).reduce(
			(total, week) =>
				total + Object.values(week).reduce((sum, day) => sum + Object.keys(day).length, 0),
			0
		);
	}

	meal(dayIndex: number, slot: MealSlot): PlannedMeal | undefined {
		return this.currentWeek[String(dayIndex)]?.[slot];
	}

	mealIn(weekKey: string, dayIndex: number, slot: MealSlot): PlannedMeal | undefined {
		return this.weeks[weekKey]?.[String(dayIndex)]?.[slot];
	}

	goToWeek(offset: number) {
		this.weekKey = shiftWeek(this.weekKey, offset);
	}

	goToCurrentWeek() {
		this.weekKey = toWeekKey(new Date());
	}

	assign(dayIndex: number, slot: MealSlot, recipe: RecipeSummary) {
		this.assignTo(this.weekKey, dayIndex, slot, recipe);
	}

	assignTo(weekKey: string, dayIndex: number, slot: MealSlot, recipe: RecipeSummary) {
		const week = { ...(this.weeks[weekKey] ?? emptyWeek()) };
		const day = { ...(week[String(dayIndex)] ?? {}) };
		day[slot] = {
			recipeId: recipe.id,
			title: recipe.title,
			image: recipe.image,
			origin: recipe.origin,
			addedAt: Date.now()
		};
		week[String(dayIndex)] = day;
		this.commit(week, weekKey);
	}

	remove(dayIndex: number, slot: MealSlot) {
		const week = { ...this.currentWeek };
		const day = { ...(week[String(dayIndex)] ?? {}) };
		delete day[slot];
		week[String(dayIndex)] = day;
		this.commit(week);
	}

	move(from: { dayIndex: number; slot: MealSlot }, to: { dayIndex: number; slot: MealSlot }) {
		const meal = this.meal(from.dayIndex, from.slot);
		if (!meal) return;

		const week = { ...this.currentWeek };
		const source = { ...(week[String(from.dayIndex)] ?? {}) };
		delete source[from.slot];
		week[String(from.dayIndex)] = source;

		const target = { ...(week[String(to.dayIndex)] ?? {}) };
		target[to.slot] = { ...meal, addedAt: Date.now() };
		week[String(to.dayIndex)] = target;

		this.commit(week);
	}

	clearWeek() {
		this.commit(emptyWeek());
	}

	clearDay(dayIndex: number) {
		const week = { ...this.currentWeek };
		week[String(dayIndex)] = {};
		this.commit(week);
	}

	updateRecipeEverywhere(recipe: RecipeSummary) {
		const archive: PlanArchive = {};
		for (const [key, week] of Object.entries(this.weeks)) {
			archive[key] = Object.fromEntries(
				Object.entries(week).map(([dayIndex, day]) => [
					dayIndex,
					Object.fromEntries(
						Object.entries(day).map(([slot, meal]) => [
							slot,
							meal?.recipeId === recipe.id
								? { ...meal, title: recipe.title, image: recipe.image, origin: recipe.origin }
								: meal
						])
					)
				])
			);
		}
		this.weeks = archive;
		writeStorage(STORAGE_KEY, this.weeks);
	}

	removeRecipeEverywhere(recipeId: string) {
		const archive: PlanArchive = {};
		for (const [key, week] of Object.entries(this.weeks)) {
			archive[key] = Object.fromEntries(
				Object.entries(week).map(([dayIndex, day]) => [
					dayIndex,
					Object.fromEntries(
						Object.entries(day).filter(([, meal]) => meal?.recipeId !== recipeId)
					)
				])
			);
		}
		this.weeks = archive;
		writeStorage(STORAGE_KEY, this.weeks);
	}

	slotsFor(recipeId: string) {
		const matches: { weekKey: string; dayIndex: number; slot: MealSlot }[] = [];
		for (const [weekKey, week] of Object.entries(this.weeks)) {
			for (const [dayIndex, day] of Object.entries(week)) {
				for (const slot of MEAL_SLOTS) {
					if (day[slot]?.recipeId === recipeId) {
						matches.push({ weekKey, dayIndex: Number(dayIndex), slot });
					}
				}
			}
		}
		return matches;
	}

	private commit(week: WeekPlan, weekKey = this.weekKey) {
		this.weeks = { ...this.weeks, [weekKey]: week };
		writeStorage(STORAGE_KEY, this.weeks);
	}
}

export const planner = new PlannerStore();
