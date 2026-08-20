<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { bindProps } from '$lib/actions/bindProps';
	import RecipeForm from '$lib/components/RecipeForm.svelte';
	import { favorites } from '$lib/state/favorites.svelte';
	import { planner } from '$lib/state/planner.svelte';
	import { userRecipes } from '$lib/state/recipes.svelte';
	import { draftToRecipe } from '$lib/utils/draft';
	import type { RecipeDraft } from '$lib/validation/recipe';

	const recipe = $derived(userRecipes.find(page.params.id ?? ''));

	function save(draft: RecipeDraft) {
		if (!recipe) return;
		const updated = userRecipes.update(recipe.id, draftToRecipe(draft));
		if (updated) {
			const summary = {
				id: updated.id,
				title: updated.title,
				image: updated.image,
				category: updated.category,
				area: updated.area,
				origin: updated.origin,
				tags: updated.tags
			};
			favorites.updateSnapshot(summary);
			planner.updateRecipeEverywhere(summary);
		}
		void goto(`/recipes/${recipe.id}`);
	}
</script>

<div class="page">
	{#if !recipe}
		<rf-empty-state
			use:bindProps={{
				icon: '🔎',
				heading: 'Recipe not found',
				message: 'This recipe may have been deleted or was created in another browser.'
			}}
		>
			<a class="btn btn-primary" href="/my-recipes">Back to my recipes</a>
		</rf-empty-state>
	{:else}
		<header class="page-header">
			<div>
				<h1>Edit recipe</h1>
				<p>Updating “{recipe.title}”.</p>
			</div>
		</header>

		<RecipeForm
			initial={recipe}
			onsubmit={save}
			oncancel={() => goto(`/recipes/${recipe.id}`)}
			submitLabel="Save changes"
		/>
	{/if}
</div>
