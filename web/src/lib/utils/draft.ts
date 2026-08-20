import type { Recipe } from '$lib/types';
import type { RecipeDraft } from '$lib/validation/recipe';

export function draftToRecipe(draft: RecipeDraft): Omit<Recipe, 'id' | 'origin' | 'createdAt' | 'updatedAt'> {
	return {
		title: draft.title.trim(),
		category: draft.category.trim(),
		area: draft.area.trim(),
		image: draft.image.trim(),
		servings: Number(draft.servings),
		cookTime: Number(draft.cookTime),
		youtube: draft.youtube.trim() || undefined,
		tags: draft.tags
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean),
		ingredients: draft.ingredients
			.filter((item) => item.name.trim())
			.map((item) => ({ name: item.name.trim(), measure: item.measure.trim() })),
		instructions: draft.instructions.map((step) => step.trim()).filter(Boolean)
	};
}
