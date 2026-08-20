import { browser } from '$app/environment';

const SCHEMA_KEY = 'rf:schema-version';
const SCHEMA_VERSION = '1';

export const storageError = $state({ message: '' });

function ensureSchema() {
	if (!browser) return;
	try {
		const stored = localStorage.getItem(SCHEMA_KEY);
		if (stored === SCHEMA_VERSION) return;
		if (stored !== null) {
			for (const key of Object.keys(localStorage).filter((key) => key.startsWith('rf:'))) {
				localStorage.removeItem(key);
			}
		}
		localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION);
	} catch {
		return;
	}
}

ensureSchema();

export function readStorage<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
	if (!browser) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed: unknown = JSON.parse(raw);
		if (!isValid(parsed)) {
			localStorage.removeItem(key);
			return fallback;
		}
		return parsed;
	} catch {
		return fallback;
	}
}

export function writeStorage<T>(key: string, value: T): boolean {
	if (!browser) return true;
	try {
		localStorage.setItem(key, JSON.stringify(value));
		storageError.message = '';
		return true;
	} catch {
		storageError.message =
			'Your changes could not be saved in this browser, so they will be lost when you reload. Storage may be full or disabled.';
		return false;
	}
}

export function onExternalChange(key: string, handler: () => void) {
	if (!browser) return;
	window.addEventListener('storage', (event) => {
		if (event.storageArea === localStorage && event.key === key) handler();
	});
}

export function isArrayOf<T>(check: (value: unknown) => boolean) {
	return (value: unknown): value is T[] => Array.isArray(value) && value.every(check);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
