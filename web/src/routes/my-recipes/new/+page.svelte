<script lang="ts">
	import { goto } from '$app/navigation';
	import RecipeForm from '$lib/components/RecipeForm.svelte';
	import { userRecipes } from '$lib/state/recipes.svelte';
	import { draftToRecipe } from '$lib/utils/draft';
	import type { RecipeDraft } from '$lib/validation/recipe';

	function save(draft: RecipeDraft) {
		const recipe = userRecipes.create(draftToRecipe(draft));
		void goto(`/recipes/${recipe.id}`);
	}
</script>

<div class="page">
	<header class="page-header">
		<div>
			<h1>Add a recipe</h1>
			<p>Fields marked with * are required.</p>
		</div>
	</header>

	<RecipeForm onsubmit={save} oncancel={() => goto('/my-recipes')} submitLabel="Create recipe" />
</div>
