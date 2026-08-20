import type { Recipe, RecipeSummary } from '$lib/types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const CACHE_LIMIT = 50;

const cache = new Map<string, Promise<unknown>>();

interface MealDbMeal {
	idMeal: string;
	strMeal: string;
	strCategory?: string;
	strArea?: string;
	strMealThumb?: string;
	strInstructions?: string;
	strTags?: string;
	strYoutube?: string;
	strSource?: string;
	[key: string]: string | undefined;
}

interface MealDbResponse {
	meals: MealDbMeal[] | null;
}

async function request<T>(path: string, fetcher: typeof fetch = fetch): Promise<T> {
	const cached = cache.get(path);
	if (cached) {
		cache.delete(path);
		cache.set(path, cached);
		return cached as Promise<T>;
	}

	const pending = fetcher(`${BASE_URL}${path}`).then((response) => {
		if (!response.ok) {
			throw new Error(`TheMealDB request failed with status ${response.status}`);
		}
		return response.json();
	});

	cache.set(path, pending);
	pending.catch(() => cache.delete(path));

	while (cache.size > CACHE_LIMIT) {
		const oldest = cache.keys().next();
		if (oldest.done) break;
		cache.delete(oldest.value);
	}

	return pending as Promise<T>;
}

export function clearRequestCache() {
	cache.clear();
}

function parseIngredients(meal: MealDbMeal) {
	const ingredients = [];
	for (let index = 1; index <= 20; index += 1) {
		const name = meal[`strIngredient${index}`]?.trim();
		const measure = meal[`strMeasure${index}`]?.trim();
		if (name) {
			ingredients.push({ name, measure: measure || 'to taste' });
		}
	}
	return ingredients;
}

function parseInstructions(raw: string | undefined): string[] {
	if (!raw) return [];
	return raw
		.split(/\r?\n+/)
		.map((step) => step.replace(/^\s*(step\s*)?\d+[.):]?\s*/i, '').trim())
		.filter((step) => step.length > 1);
}

export function normalizeMeal(meal: MealDbMeal): Recipe {
	return {
		id: meal.idMeal,
		title: meal.strMeal,
		category: meal.strCategory ?? '',
		area: meal.strArea ?? '',
		image: meal.strMealThumb ?? '',
		instructions: parseInstructions(meal.strInstructions),
		ingredients: parseIngredients(meal),
		tags: meal.strTags ? meal.strTags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
		youtube: meal.strYoutube || undefined,
		source: meal.strSource || undefined,
		origin: 'api'
	};
}

export function toSummary(meal: MealDbMeal, known: Partial<RecipeSummary> = {}): RecipeSummary {
	return {
		id: meal.idMeal,
		title: meal.strMeal,
		image: meal.strMealThumb ?? '',
		category: meal.strCategory ?? '',
		area: meal.strArea ?? '',
		origin: 'api',
		...known
	};
}

export async function searchRecipes(term: string, fetcher?: typeof fetch): Promise<RecipeSummary[]> {
	const data = await request<MealDbResponse>(`/search.php?s=${encodeURIComponent(term)}`, fetcher);
	return (data.meals ?? []).map((meal) => toSummary(meal));
}

export async function filterByCategory(category: string, fetcher?: typeof fetch): Promise<RecipeSummary[]> {
	const data = await request<MealDbResponse>(`/filter.php?c=${encodeURIComponent(category)}`, fetcher);
	return (data.meals ?? []).map((meal) => toSummary(meal, { category }));
}

export async function filterByArea(area: string, fetcher?: typeof fetch): Promise<RecipeSummary[]> {
	const data = await request<MealDbResponse>(`/filter.php?a=${encodeURIComponent(area)}`, fetcher);
	return (data.meals ?? []).map((meal) => toSummary(meal, { area }));
}

export async function getRecipeById(id: string, fetcher?: typeof fetch): Promise<Recipe | null> {
	const data = await request<MealDbResponse>(`/lookup.php?i=${encodeURIComponent(id)}`, fetcher);
	const meal = data.meals?.[0];
	return meal ? normalizeMeal(meal) : null;
}

export async function getRandomRecipe(fetcher?: typeof fetch): Promise<Recipe | null> {
	const response = await (fetcher ?? fetch)(`${BASE_URL}/random.php`);
	if (!response.ok) {
		throw new Error(`TheMealDB request failed with status ${response.status}`);
	}
	const data = (await response.json()) as MealDbResponse;
	const meal = data.meals?.[0];
	return meal ? normalizeMeal(meal) : null;
}

export async function listCategories(fetcher?: typeof fetch): Promise<string[]> {
	const data = await request<{ meals: { strCategory: string }[] | null }>('/list.php?c=list', fetcher);
	return (data.meals ?? []).map((entry) => entry.strCategory).filter(Boolean);
}

export async function listAreas(fetcher?: typeof fetch): Promise<string[]> {
	const data = await request<{ meals: { strArea: string }[] | null }>('/list.php?a=list', fetcher);
	return (data.meals ?? []).map((entry) => entry.strArea).filter(Boolean);
}

export async function discover(
	params: { term?: string; category?: string; area?: string },
	fetcher?: typeof fetch
): Promise<RecipeSummary[]> {
	const { term = '', category = '', area = '' } = params;

	if (term) {
		const results = await searchRecipes(term, fetcher);
		return results.filter(
			(recipe) =>
				(!category || recipe.category === category) && (!area || recipe.area === area)
		);
	}

	if (category && area) {
		const [byCategory, byArea] = await Promise.all([
			filterByCategory(category, fetcher),
			filterByArea(area, fetcher)
		]);
		const areaIds = new Set(byArea.map((recipe) => recipe.id));
		return byCategory.filter((recipe) => areaIds.has(recipe.id)).map((recipe) => ({ ...recipe, area }));
	}

	if (category) return filterByCategory(category, fetcher);
	if (area) return filterByArea(area, fetcher);

	return searchRecipes('', fetcher);
}
