import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRequestCache, discover, normalizeMeal, searchRecipes, toSummary } from '$lib/api/mealdb';

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

describe('discover', () => {
	const listing = (ids: string[]) => ({
		meals: ids.map((id) => ({ idMeal: id, strMeal: `Meal ${id}`, strMealThumb: '', strArea: null }))
	});

	function stubFetch(routes: Record<string, unknown>) {
		const calls: string[] = [];
		const fetcher = vi.fn(async (url: string) => {
			calls.push(url);
			const match = Object.keys(routes).find((key) => url.includes(key));
			return {
				ok: true,
				json: async () => (match ? routes[match] : { meals: null })
			} as Response;
		});
		return { fetcher: fetcher as unknown as typeof fetch, calls };
	}

	beforeEach(() => {
		clearRequestCache();
	});

	it('stamps the requested category onto results that the API omits it from', async () => {
		const { fetcher } = stubFetch({ 'filter.php?c=Seafood': listing(['1', '2']) });

		const results = await discover({ category: 'Seafood' }, fetcher);

		expect(results).toHaveLength(2);
		expect(results.every((recipe) => recipe.category === 'Seafood')).toBe(true);
	});

	it('stamps both filters onto the intersection of category and area', async () => {
		const { fetcher } = stubFetch({
			'filter.php?c=Seafood': listing(['1', '2', '3']),
			'filter.php?a=Japanese': listing(['2', '3', '4'])
		});

		const results = await discover({ category: 'Seafood', area: 'Japanese' }, fetcher);

		expect(results.map((recipe) => recipe.id)).toEqual(['2', '3']);
		expect(results.every((recipe) => recipe.category === 'Seafood' && recipe.area === 'Japanese')).toBe(
			true
		);
	});

	it('narrows a keyword search with the active filters', async () => {
		const { fetcher } = stubFetch({
			'search.php?s=rice': {
				meals: [
					{ idMeal: '1', strMeal: 'Sushi', strCategory: 'Seafood', strArea: 'Japanese' },
					{ idMeal: '2', strMeal: 'Risotto', strCategory: 'Vegetarian', strArea: 'Italian' }
				]
			}
		});

		const results = await discover({ term: 'rice', category: 'Seafood' }, fetcher);

		expect(results.map((recipe) => recipe.id)).toEqual(['1']);
	});
});

describe('request cache', () => {
	beforeEach(() => {
		clearRequestCache();
	});

	it('reuses an in-flight request for the same path', async () => {
		const fetcher = vi.fn(
			async () => ({ ok: true, json: async () => ({ meals: null }) }) as Response
		) as unknown as typeof fetch;

		await Promise.all([searchRecipes('pasta', fetcher), searchRecipes('pasta', fetcher)]);

		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('evicts the least recently used entry once the cap is reached', async () => {
		const fetcher = vi.fn(
			async () => ({ ok: true, json: async () => ({ meals: null }) }) as Response
		) as unknown as typeof fetch;

		for (let index = 0; index < 60; index += 1) {
			await searchRecipes(`term-${index}`, fetcher);
		}
		const afterFill = (fetcher as unknown as { mock: { calls: unknown[] } }).mock.calls.length;

		await searchRecipes('term-0', fetcher);

		expect(afterFill).toBe(60);
		expect((fetcher as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(61);
	});
});
