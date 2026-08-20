import type { FilterGroup, RecipeCardData, TagTone } from 'recipe-finder-ui';

declare global {
	namespace App {}

	namespace svelteHTML {
		interface IntrinsicElements {
			'rf-search-bar': {
				value?: string;
				placeholder?: string;
				label?: string;
				debounce?: number;
				disabled?: boolean;
				onrfSearch?: (event: CustomEvent<string>) => void;
				onrfClear?: (event: CustomEvent<void>) => void;
			};
			'rf-filter-bar': {
				groups?: FilterGroup[];
				selected?: Record<string, string>;
				resettable?: boolean;
				onrfFilterChange?: (event: CustomEvent<{ group: string; value: string }>) => void;
				onrfFilterReset?: (event: CustomEvent<void>) => void;
			};
			'rf-recipe-card': {
				recipe?: RecipeCardData;
				favorite?: boolean;
				badge?: string;
				compact?: boolean;
				onrfSelect?: (event: CustomEvent<RecipeCardData>) => void;
				onrfFavoriteToggle?: (
					event: CustomEvent<{ recipe: RecipeCardData; favorite: boolean }>
				) => void;
			};
			'rf-rating': {
				value?: number;
				max?: number;
				readonly?: boolean;
				label?: string;
				onrfRate?: (event: CustomEvent<number>) => void;
			};
			'rf-modal': {
				open?: boolean;
				heading?: string;
				size?: 'sm' | 'md' | 'lg';
				dismissible?: boolean;
				onrfClose?: (event: CustomEvent<void>) => void;
			};
			'rf-empty-state': {
				icon?: string;
				heading?: string;
				message?: string;
			};
			'rf-tag': {
				label?: string;
				tone?: TagTone;
				removable?: boolean;
				onrfRemove?: (event: CustomEvent<string>) => void;
			};
		}
	}
}

export {};
