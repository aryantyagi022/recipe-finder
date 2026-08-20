import type { Recipe } from '$lib/types';
import { readStorage, writeStorage } from './storage';

const STORAGE_KEY = 'rf:user-recipes';

export const USER_RECIPE_PREFIX = 'user-';

export function isUserRecipeId(id: string) {
	return id.startsWith(USER_RECIPE_PREFIX);
}

class UserRecipeStore {
	items = $state<Recipe[]>([]);

	constructor() {
		this.items = readStorage<Recipe[]>(STORAGE_KEY, []);
	}

	get count() {
		return this.items.length;
	}

	get categories() {
		return [...new Set(this.items.map((recipe) => recipe.category).filter(Boolean))].sort();
	}

	find(id: string) {
		return this.items.find((recipe) => recipe.id === id) ?? null;
	}

	create(draft: Omit<Recipe, 'id' | 'origin' | 'createdAt' | 'updatedAt'>) {
		const now = Date.now();
		const recipe: Recipe = {
			...draft,
			id: `${USER_RECIPE_PREFIX}${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`,
			origin: 'user',
			createdAt: now,
			updatedAt: now
		};
		this.items = [recipe, ...this.items];
		this.persist();
		return recipe;
	}

	update(id: string, changes: Partial<Recipe>) {
		const existing = this.find(id);
		if (!existing) return null;

		const updated: Recipe = { ...existing, ...changes, id, origin: 'user', updatedAt: Date.now() };
		this.items = this.items.map((recipe) => (recipe.id === id ? updated : recipe));
		this.persist();
		return updated;
	}

	remove(id: string) {
		this.items = this.items.filter((recipe) => recipe.id !== id);
		this.persist();
	}

	private persist() {
		writeStorage(STORAGE_KEY, this.items);
	}
}

export const userRecipes = new UserRecipeStore();
