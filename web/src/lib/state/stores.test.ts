import { describe, expect, it } from 'vitest';
import { favorites } from '$lib/state/favorites.svelte';
import { planner } from '$lib/state/planner.svelte';
import { userRecipes } from '$lib/state/recipes.svelte';
import type { RecipeSummary } from '$lib/types';
import { shiftWeek } from '$lib/utils/date';

const pasta: RecipeSummary = {
	id: '1',
	title: 'Pasta',
	image: 'https://example.test/pasta.jpg',
	category: 'Pasta',
	area: 'Italian',
	origin: 'api'
};

const curry: RecipeSummary = { ...pasta, id: '2', title: 'Curry', category: 'Chicken' };

describe('favorites store', () => {
	it('toggles a recipe in and out of the list', () => {
		favorites.clear();

		favorites.toggle(pasta);
		expect(favorites.has('1')).toBe(true);
		expect(favorites.count).toBe(1);

		favorites.toggle(pasta);
		expect(favorites.has('1')).toBe(false);
	});

	it('removes by id without touching the rest', () => {
		favorites.clear();
		favorites.toggle(pasta);
		favorites.toggle(curry);

		favorites.remove('1');

		expect(favorites.items.map((item) => item.id)).toEqual(['2']);
	});
});

describe('user recipe store', () => {
	it('creates recipes with a prefixed id and timestamps', () => {
		const created = userRecipes.create({
			title: 'Soup',
			category: 'Starter',
			area: '',
			image: '',
			instructions: ['Simmer everything.'],
			ingredients: [{ name: 'Stock', measure: '1 l' }],
			tags: []
		});

		expect(created.id.startsWith('user-')).toBe(true);
		expect(created.origin).toBe('user');
		expect(userRecipes.find(created.id)?.title).toBe('Soup');

		userRecipes.remove(created.id);
		expect(userRecipes.find(created.id)).toBeNull();
	});

	it('applies partial updates and preserves the id', () => {
		const created = userRecipes.create({
			title: 'Stew',
			category: 'Beef',
			area: '',
			image: '',
			instructions: ['Cook slowly.'],
			ingredients: [{ name: 'Beef', measure: '500 g' }],
			tags: []
		});

		const updated = userRecipes.update(created.id, { title: 'Beef stew' });

		expect(updated?.id).toBe(created.id);
		expect(updated?.title).toBe('Beef stew');
		expect(updated?.category).toBe('Beef');

		userRecipes.remove(created.id);
	});
});

describe('planner store', () => {
	it('assigns, replaces and removes meals in a slot', () => {
		planner.clearWeek();

		planner.assign(0, 'dinner', pasta);
		expect(planner.meal(0, 'dinner')?.title).toBe('Pasta');
		expect(planner.plannedCount).toBe(1);

		planner.assign(0, 'dinner', curry);
		expect(planner.meal(0, 'dinner')?.title).toBe('Curry');
		expect(planner.plannedCount).toBe(1);

		planner.remove(0, 'dinner');
		expect(planner.meal(0, 'dinner')).toBeUndefined();
	});

	it('moves a meal between slots', () => {
		planner.clearWeek();
		planner.assign(1, 'lunch', pasta);

		planner.move({ dayIndex: 1, slot: 'lunch' }, { dayIndex: 3, slot: 'breakfast' });

		expect(planner.meal(1, 'lunch')).toBeUndefined();
		expect(planner.meal(3, 'breakfast')?.recipeId).toBe('1');
	});

	it('clears a single day without affecting others', () => {
		planner.clearWeek();
		planner.assign(2, 'lunch', pasta);
		planner.assign(4, 'dinner', curry);

		planner.clearDay(2);

		expect(planner.meal(2, 'lunch')).toBeUndefined();
		expect(planner.meal(4, 'dinner')?.recipeId).toBe('2');
	});

	it('reports every slot a recipe occupies and can purge it', () => {
		planner.clearWeek();
		planner.assign(0, 'lunch', pasta);
		planner.assign(5, 'dinner', pasta);

		expect(planner.slotsFor('1')).toHaveLength(2);

		planner.removeRecipeEverywhere('1');
		expect(planner.slotsFor('1')).toHaveLength(0);
	});

	it('navigates between weeks', () => {
		const start = planner.weekKey;

		planner.goToWeek(1);
		expect(planner.weekKey).not.toBe(start);

		planner.goToCurrentWeek();
		expect(planner.weekKey).toBe(start);
	});
});

describe('snapshot cascades', () => {
	it('refreshes the favorites snapshot when a recipe is edited', () => {
		favorites.clear();
		favorites.toggle(pasta);

		favorites.updateSnapshot({ ...pasta, title: 'Pasta Deluxe', image: 'https://example.test/new.jpg' });

		expect(favorites.items[0].title).toBe('Pasta Deluxe');
		expect(favorites.items[0].image).toBe('https://example.test/new.jpg');
	});

	it('leaves recipes that are not favorited untouched', () => {
		favorites.clear();
		favorites.toggle(pasta);

		favorites.updateSnapshot({ ...curry, title: 'Curry Deluxe' });

		expect(favorites.items).toHaveLength(1);
		expect(favorites.items[0].title).toBe('Pasta');
	});

	it('refreshes planned meals in every week when a recipe is edited', () => {
		planner.clearWeek();
		planner.goToCurrentWeek();
		const thisWeek = planner.weekKey;
		planner.assign(0, 'lunch', pasta);
		planner.goToWeek(1);
		const nextWeek = planner.weekKey;
		planner.assign(3, 'dinner', pasta);

		planner.updateRecipeEverywhere({ ...pasta, title: 'Pasta Deluxe' });

		expect(planner.mealIn(thisWeek, 0, 'lunch')?.title).toBe('Pasta Deluxe');
		expect(planner.mealIn(nextWeek, 3, 'dinner')?.title).toBe('Pasta Deluxe');

		planner.clearWeek();
		planner.goToCurrentWeek();
		planner.clearWeek();
	});
});

describe('assignTo', () => {
	it('writes into an explicit week without moving the selected week', () => {
		planner.goToCurrentWeek();
		planner.clearWeek();
		const selected = planner.weekKey;
		const target = shiftWeek(selected, 2);

		planner.assignTo(target, 4, 'breakfast', curry);

		expect(planner.weekKey).toBe(selected);
		expect(planner.plannedCount).toBe(0);
		expect(planner.mealIn(target, 4, 'breakfast')?.title).toBe('Curry');
	});
});
