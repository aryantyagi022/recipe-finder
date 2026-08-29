<script lang="ts">
	import { bindProps } from '$lib/actions/bindProps';
	import AddToPlanModal from '$lib/components/AddToPlanModal.svelte';
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { favorites } from '$lib/state/favorites.svelte';
	import { planner } from '$lib/state/planner.svelte';
	import { ratings } from '$lib/state/ratings.svelte';
	import { userRecipes } from '$lib/state/recipes.svelte';
	import type { RecipeSummary } from '$lib/types';

	let planningRecipe = $state<RecipeSummary | null>(null);
	let pendingDelete = $state<RecipeSummary | null>(null);

	const recipes = $derived(
		userRecipes.items.map<RecipeSummary>((recipe) => ({
			id: recipe.id,
			title: recipe.title,
			image: recipe.image,
			category: recipe.category,
			area: recipe.area,
			origin: 'user',
			tags: recipe.tags
		}))
	);

	function remove() {
		if (!pendingDelete) return;
		userRecipes.remove(pendingDelete.id);
		favorites.remove(pendingDelete.id);
		planner.removeRecipeEverywhere(pendingDelete.id);
		ratings.clear(pendingDelete.id);
		pendingDelete = null;
	}
</script>

<div class="page">
	<header class="page-header">
		<div>
			<h1>My recipes</h1>
			<p>Recipes you have created are stored in this browser and can be edited any time.</p>
		</div>
		<a class="btn btn-primary" href="/my-recipes/new">Add recipe</a>
	</header>

	{#if recipes.length === 0}
		<rf-empty-state
			use:bindProps={{
				icon: '📝',
				heading: 'You have not created any recipes yet',
				message: 'Add your own recipes to keep them alongside the ones you discover.'
			}}
		>
			<a class="btn btn-primary" href="/my-recipes/new">Create your first recipe</a>
		</rf-empty-state>
	{:else}
		<RecipeGrid
			{recipes}
			onplan={(recipe) => (planningRecipe = recipe)}
			onremove={(recipe) => (pendingDelete = recipe)}
			removeLabel="Delete"
		/>
	{/if}
</div>

<AddToPlanModal recipe={planningRecipe} onclose={() => (planningRecipe = null)} />

<rf-modal
	use:bindProps={{ open: Boolean(pendingDelete), heading: 'Delete recipe', size: 'sm' }}
	onrfClose={() => (pendingDelete = null)}
>
	<p>
		Delete <strong>{pendingDelete?.title}</strong>? This also removes it from your favorites and
		meal plans.
	</p>
	<div slot="footer" class="modal-actions">
		<button type="button" class="btn btn-secondary" onclick={() => (pendingDelete = null)}>
			Cancel
		</button>
		<button type="button" class="btn btn-danger" onclick={remove}>Delete</button>
	</div>
</rf-modal>

<style>
	.modal-actions {
		display: flex;
		gap: var(--rf-space-sm);
	}
</style>
