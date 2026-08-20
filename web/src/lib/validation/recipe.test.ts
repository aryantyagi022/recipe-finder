import { describe, expect, it } from 'vitest';
import { emptyDraft, isValid, validateRecipe, type RecipeDraft } from '$lib/validation/recipe';

function validDraft(overrides: Partial<RecipeDraft> = {}): RecipeDraft {
	return {
		...emptyDraft(),
		title: 'Creamy tomato pasta',
		category: 'Pasta',
		image: 'https://example.test/pasta.jpg',
		ingredients: [{ name: 'Pasta', measure: '200 g' }],
		instructions: ['Boil the pasta until al dente.'],
		...overrides
	};
}

describe('validateRecipe', () => {
	it('accepts a complete draft', () => {
		expect(isValid(validateRecipe(validDraft()))).toBe(true);
	});

	it('requires a title of at least three characters', () => {
		expect(validateRecipe(validDraft({ title: '' })).title).toBe('Title is required');
		expect(validateRecipe(validDraft({ title: 'ab' })).title).toBe(
			'Title must be at least 3 characters'
		);
	});

	it('requires a category', () => {
		expect(validateRecipe(validDraft({ category: '   ' })).category).toBe('Category is required');
	});

	it('rejects malformed urls but allows empty ones', () => {
		expect(validateRecipe(validDraft({ image: 'not-a-url' })).image).toBeDefined();
		expect(validateRecipe(validDraft({ image: '' })).image).toBeUndefined();
		expect(validateRecipe(validDraft({ youtube: 'ftp://videos' })).youtube).toBeDefined();
	});

	it('bounds servings and cook time', () => {
		expect(validateRecipe(validDraft({ servings: 0 })).servings).toBeDefined();
		expect(validateRecipe(validDraft({ servings: 51 })).servings).toBeDefined();
		expect(validateRecipe(validDraft({ cookTime: 1441 })).cookTime).toBeDefined();
		expect(validateRecipe(validDraft({ cookTime: 'abc' })).cookTime).toBeDefined();
	});

	it('needs at least one ingredient, each with a quantity', () => {
		expect(validateRecipe(validDraft({ ingredients: [{ name: '', measure: '' }] })).ingredients).toBe(
			'Add at least one ingredient'
		);
		expect(
			validateRecipe(validDraft({ ingredients: [{ name: 'Pasta', measure: ' ' }] })).ingredients
		).toBe('Every ingredient needs a quantity');
	});

	it('needs at least one meaningful instruction step', () => {
		expect(validateRecipe(validDraft({ instructions: ['   '] })).instructions).toBe(
			'Add at least one instruction step'
		);
		expect(validateRecipe(validDraft({ instructions: ['Mix'] })).instructions).toBe(
			'Each step should be at least 5 characters'
		);
	});
});
