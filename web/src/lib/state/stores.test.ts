import { describe, expect, it } from 'vitest';
import { favorites } from '$lib/state/favorites.svelte';
import { planner } from '$lib/state/planner.svelte';
import { userRecipes } from '$lib/state/recipes.svelte';
import type { RecipeSummary } from '$lib/types';

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
