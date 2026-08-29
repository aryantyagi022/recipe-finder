import { isRecord, onExternalChange, readStorage, writeStorage } from './storage.svelte';

const STORAGE_KEY = 'rf:ratings';

export const MAX_RATING = 5;

const isRatingMap = (value: unknown): value is Record<string, number> =>
	isRecord(value) &&
	Object.values(value).every(
		(rating) =>
			typeof rating === 'number' &&
			Number.isInteger(rating) &&
			rating >= 1 &&
			rating <= MAX_RATING
	);

class RatingsStore {
	values = $state<Record<string, number>>({});

	constructor() {
		this.values = this.load();
		onExternalChange(STORAGE_KEY, () => (this.values = this.load()));
	}

	private load() {
		return readStorage(STORAGE_KEY, {} as Record<string, number>, isRatingMap);
	}

	get(id: string) {
		return this.values[id] ?? 0;
	}

	set(id: string, rating: number) {
		const value = Math.round(rating);
		if (!Number.isFinite(value) || value < 1 || value > MAX_RATING) {
			this.clear(id);
			return;
		}
		this.values = { ...this.values, [id]: value };
		this.persist();
	}

	clear(id: string) {
		if (!(id in this.values)) return;
		const { [id]: _removed, ...rest } = this.values;
		this.values = rest;
		this.persist();
	}

	clearAll() {
		this.values = {};
		this.persist();
	}

	private persist() {
		writeStorage(STORAGE_KEY, this.values);
	}
}

export const ratings = new RatingsStore();
