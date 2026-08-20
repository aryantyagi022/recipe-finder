import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/environment', () => ({ browser: true, building: false, dev: true, version: 'test' }));

class MemoryStorage {
	private map = new Map<string, string>();
	failOnWrite = false;

	get length() {
		return this.map.size;
	}

	key(index: number) {
		return [...this.map.keys()][index] ?? null;
	}

	getItem(key: string) {
		return this.map.get(key) ?? null;
	}

	setItem(key: string, value: string) {
		if (this.failOnWrite) {
			const error = new Error('QuotaExceededError');
			error.name = 'QuotaExceededError';
			throw error;
		}
		this.map.set(key, value);
	}

	removeItem(key: string) {
		this.map.delete(key);
	}

	clear() {
		this.map.clear();
	}
}

const store = new MemoryStorage();
const listeners: ((event: StorageEvent) => void)[] = [];

vi.stubGlobal('localStorage', store);
vi.stubGlobal('window', {
	addEventListener: (type: string, handler: (event: StorageEvent) => void) => {
		if (type === 'storage') listeners.push(handler);
	}
});

const { isArrayOf, isRecord, onExternalChange, readStorage, storageError, writeStorage } =
	await import('$lib/state/storage.svelte');

const isString = (value: unknown) => typeof value === 'string';

describe('readStorage', () => {
	beforeEach(() => {
		store.clear();
		store.failOnWrite = false;
		storageError.message = '';
	});

	it('returns the fallback when the key is absent', () => {
		expect(readStorage('rf:missing', ['default'], isArrayOf<string>(isString))).toEqual(['default']);
	});

	it('returns the stored value when it passes validation', () => {
		store.setItem('rf:items', JSON.stringify(['a', 'b']));

		expect(readStorage('rf:items', [] as string[], isArrayOf<string>(isString))).toEqual(['a', 'b']);
	});

	it('falls back and discards the key when the payload is unparseable', () => {
		store.setItem('rf:items', '{not json');

		expect(readStorage('rf:items', [] as string[], isArrayOf<string>(isString))).toEqual([]);
	});

	it('falls back and discards the key when the payload has the wrong shape', () => {
		store.setItem('rf:items', JSON.stringify({ nope: true }));

		expect(readStorage('rf:items', [] as string[], isArrayOf<string>(isString))).toEqual([]);
		expect(store.getItem('rf:items')).toBeNull();
	});

	it('rejects an array whose entries fail the element check', () => {
		store.setItem('rf:items', JSON.stringify(['a', 42]));

		expect(readStorage('rf:items', [] as string[], isArrayOf<string>(isString))).toEqual([]);
	});
});

describe('writeStorage', () => {
	beforeEach(() => {
		store.clear();
		store.failOnWrite = false;
		storageError.message = '';
	});

	it('persists the value and reports success', () => {
		expect(writeStorage('rf:items', ['a'])).toBe(true);
		expect(store.getItem('rf:items')).toBe(JSON.stringify(['a']));
		expect(storageError.message).toBe('');
	});

	it('reports failure and surfaces a message when the quota is exceeded', () => {
		store.failOnWrite = true;

		expect(writeStorage('rf:items', ['a'])).toBe(false);
		expect(storageError.message).toContain('could not be saved');
	});

	it('clears a previous error once a write succeeds again', () => {
		store.failOnWrite = true;
		writeStorage('rf:items', ['a']);
		store.failOnWrite = false;

		writeStorage('rf:items', ['b']);

		expect(storageError.message).toBe('');
	});
});

describe('isRecord', () => {
	it('accepts plain objects and rejects arrays and null', () => {
		expect(isRecord({ a: 1 })).toBe(true);
		expect(isRecord([])).toBe(false);
		expect(isRecord(null)).toBe(false);
	});
});

describe('onExternalChange', () => {
	it('fires only for the watched key on the same storage area', () => {
		const handler = vi.fn();
		onExternalChange('rf:items', handler);
		const notify = listeners[listeners.length - 1];

		notify({ key: 'rf:other', storageArea: store } as unknown as StorageEvent);
		expect(handler).not.toHaveBeenCalled();

		notify({ key: 'rf:items', storageArea: store } as unknown as StorageEvent);
		expect(handler).toHaveBeenCalledTimes(1);
	});
});
