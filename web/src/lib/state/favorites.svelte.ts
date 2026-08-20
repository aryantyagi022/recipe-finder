import type { RecipeSummary } from '$lib/types';
import { readStorage, writeStorage } from './storage';

const STORAGE_KEY = 'rf:favorites';

class FavoritesStore {
	items = $state<RecipeSummary[]>([]);

	constructor() {
		this.items = readStorage<RecipeSummary[]>(STORAGE_KEY, []);
	}

	get count() {
		return this.items.length;
	}

	has(id: string) {
		return this.items.some((item) => item.id === id);
	}

	toggle(recipe: RecipeSummary) {
		this.items = this.has(recipe.id)
			? this.items.filter((item) => item.id !== recipe.id)
			: [...this.items, recipe];
		this.persist();
	}

	remove(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
		this.persist();
	}

	clear() {
		this.items = [];
		this.persist();
	}

	private persist() {
		writeStorage(STORAGE_KEY, this.items);
	}
}

export const favorites = new FavoritesStore();
