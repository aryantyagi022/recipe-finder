import type { RecipeSummary } from '$lib/types';
import { isArrayOf, onExternalChange, readStorage, writeStorage } from './storage.svelte';

const STORAGE_KEY = 'rf:favorites';

const isSummary = (value: unknown) =>
	typeof value === 'object' && value !== null && typeof (value as RecipeSummary).id === 'string';

class FavoritesStore {
	items = $state<RecipeSummary[]>([]);

	constructor() {
		this.items = this.load();
		onExternalChange(STORAGE_KEY, () => (this.items = this.load()));
	}

	private load() {
		return readStorage(STORAGE_KEY, [] as RecipeSummary[], isArrayOf<RecipeSummary>(isSummary));
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

	updateSnapshot(recipe: RecipeSummary) {
		if (!this.has(recipe.id)) return;
		this.items = this.items.map((item) => (item.id === recipe.id ? { ...item, ...recipe } : item));
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
