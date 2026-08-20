import type { Ingredient } from '$lib/types';

export interface RecipeDraft {
	title: string;
	category: string;
	area: string;
	image: string;
	servings: number | string;
	cookTime: number | string;
	tags: string;
	youtube: string;
	ingredients: Ingredient[];
	instructions: string[];
}

export type RecipeErrors = Partial<Record<keyof RecipeDraft, string>>;

const URL_PATTERN = /^https?:\/\/\S+$/i;

export function emptyDraft(): RecipeDraft {
	return {
		title: '',
		category: '',
		area: '',
		image: '',
		servings: 2,
		cookTime: 30,
		tags: '',
		youtube: '',
		ingredients: [{ name: '', measure: '' }],
		instructions: ['']
	};
}

export function validateRecipe(draft: RecipeDraft): RecipeErrors {
	const errors: RecipeErrors = {};
	const title = draft.title.trim();
	const servings = Number(draft.servings);
	const cookTime = Number(draft.cookTime);

	if (!title) {
		errors.title = 'Title is required';
	} else if (title.length < 3) {
		errors.title = 'Title must be at least 3 characters';
	} else if (title.length > 80) {
		errors.title = 'Title must be 80 characters or fewer';
	}

	if (!draft.category.trim()) {
		errors.category = 'Category is required';
	}

	if (draft.image.trim() && !URL_PATTERN.test(draft.image.trim())) {
		errors.image = 'Image must be a valid http(s) URL';
	}

	if (draft.youtube.trim() && !URL_PATTERN.test(draft.youtube.trim())) {
		errors.youtube = 'Video link must be a valid http(s) URL';
	}

	if (!Number.isFinite(servings) || servings < 1 || servings > 50) {
		errors.servings = 'Servings must be between 1 and 50';
	}

	if (!Number.isFinite(cookTime) || cookTime < 1 || cookTime > 1440) {
		errors.cookTime = 'Cook time must be between 1 and 1440 minutes';
	}

	const filledIngredients = draft.ingredients.filter((item) => item.name.trim());
	if (filledIngredients.length === 0) {
		errors.ingredients = 'Add at least one ingredient';
	} else if (filledIngredients.some((item) => !item.measure.trim())) {
		errors.ingredients = 'Every ingredient needs a quantity';
	}

	const filledSteps = draft.instructions.filter((step) => step.trim());
	if (filledSteps.length === 0) {
		errors.instructions = 'Add at least one instruction step';
	} else if (filledSteps.some((step) => step.trim().length < 5)) {
		errors.instructions = 'Each step should be at least 5 characters';
	}

	return errors;
}

export function isValid(errors: RecipeErrors): boolean {
	return Object.keys(errors).length === 0;
}
