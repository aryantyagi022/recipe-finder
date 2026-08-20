import { describe, expect, it } from 'vitest';
import { normalizeMeal, toSummary } from '$lib/api/mealdb';

const meal = {
	idMeal: '52772',
	strMeal: 'Teriyaki Chicken Casserole',
	strCategory: 'Chicken',
	strArea: 'Japanese',
	strMealThumb: 'https://example.test/teriyaki.jpg',
	strInstructions:
		'1. Preheat oven to 350°F.\r\n2. Combine soy sauce and water.\r\n\r\n3. Bake for 35 minutes.',
	strTags: 'Meat, Casserole,,',
	strYoutube: 'https://youtube.com/watch?v=abc',
	strIngredient1: 'soy sauce',
	strMeasure1: '3/4 cup',
	strIngredient2: 'water',
	strMeasure2: '  ',
	strIngredient3: '   ',
	strMeasure3: '1 cup'
};

describe('normalizeMeal', () => {
	it('maps the flat TheMealDB payload onto the shared Recipe shape', () => {
		const recipe = normalizeMeal(meal);

		expect(recipe.id).toBe('52772');
		expect(recipe.title).toBe('Teriyaki Chicken Casserole');
		expect(recipe.origin).toBe('api');
		expect(recipe.youtube).toBe('https://youtube.com/watch?v=abc');
	});

	it('pairs ingredients with measures and drops empty rows', () => {
		expect(normalizeMeal(meal).ingredients).toEqual([
			{ name: 'soy sauce', measure: '3/4 cup' },
			{ name: 'water', measure: 'to taste' }
		]);
	});

	it('splits instructions into steps and strips numeric prefixes', () => {
		expect(normalizeMeal(meal).instructions).toEqual([
			'Preheat oven to 350°F.',
			'Combine soy sauce and water.',
			'Bake for 35 minutes.'
		]);
	});

	it('trims tags and removes blanks', () => {
		expect(normalizeMeal(meal).tags).toEqual(['Meat', 'Casserole']);
	});

	it('falls back to empty values for missing fields', () => {
		const sparse = normalizeMeal({ idMeal: '1', strMeal: 'Toast' });

		expect(sparse.category).toBe('');
		expect(sparse.instructions).toEqual([]);
		expect(sparse.ingredients).toEqual([]);
		expect(sparse.youtube).toBeUndefined();
	});
});

describe('toSummary', () => {
	it('keeps only the fields the grid needs', () => {
		expect(toSummary(meal)).toEqual({
			id: '52772',
			title: 'Teriyaki Chicken Casserole',
			image: 'https://example.test/teriyaki.jpg',
			category: 'Chicken',
			area: 'Japanese',
			origin: 'api'
		});
	});
});
