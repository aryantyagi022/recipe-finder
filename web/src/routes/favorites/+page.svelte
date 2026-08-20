<script lang="ts">
	import { bindProps } from '$lib/actions/bindProps';
	import AddToPlanModal from '$lib/components/AddToPlanModal.svelte';
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { favorites } from '$lib/state/favorites.svelte';
	import type { RecipeSummary } from '$lib/types';

	let planningRecipe = $state<RecipeSummary | null>(null);
	let filter = $state('');
	let confirmClear = $state(false);

	const categories = $derived([
		...new Set(favorites.items.map((recipe) => recipe.category).filter(Boolean))
	].sort());

	const shown = $derived(
		filter ? favorites.items.filter((recipe) => recipe.category === filter) : favorites.items
	);
</script>

<div class="page">
	<header class="page-header">
		<div>
			<h1>Favorites</h1>
			<p>
				{favorites.count} recipe{favorites.count === 1 ? '' : 's'} saved for later.
			</p>
		</div>
		{#if favorites.count > 0}
			<div class="tools">
				<select bind:value={filter} aria-label="Filter favorites by category">
					<option value="">All categories</option>
					{#each categories as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
				<button type="button" class="btn btn-secondary" onclick={() => (confirmClear = true)}>
					Clear all
				</button>
			</div>
		{/if}
	</header>

	{#if favorites.count === 0}
		<rf-empty-state
			use:bindProps={{
				icon: '♡',
				heading: 'No favorites yet',
				message: 'Tap the heart on any recipe card to keep it here for quick access.'
			}}
		>
			<a class="btn btn-primary" href="/">Discover recipes</a>
		</rf-empty-state>
	{:else if shown.length === 0}
		<rf-empty-state
			use:bindProps={{
				icon: '🥄',
				heading: 'No favorites in this category',
				message: 'Choose another category to see more of your saved recipes.'
			}}
		>
			<button type="button" class="btn btn-secondary" onclick={() => (filter = '')}>
				Show all
			</button>
		</rf-empty-state>
	{:else}
		<RecipeGrid
			recipes={shown}
			onplan={(recipe) => (planningRecipe = recipe)}
			onremove={(recipe) => favorites.remove(recipe.id)}
		/>
	{/if}
</div>

<AddToPlanModal recipe={planningRecipe} onclose={() => (planningRecipe = null)} />

<rf-modal
	use:bindProps={{ open: confirmClear, heading: 'Clear favorites', size: 'sm' }}
	onrfClose={() => (confirmClear = false)}
>
	<p>Remove all {favorites.count} recipes from your favorites?</p>
	<div slot="footer" class="modal-actions">
		<button type="button" class="btn btn-secondary" onclick={() => (confirmClear = false)}>
			Cancel
		</button>
		<button
			type="button"
			class="btn btn-danger"
			onclick={() => {
				favorites.clear();
				confirmClear = false;
			}}
		>
			Clear all
		</button>
	</div>
</rf-modal>

<style>
	.tools {
		display: flex;
		gap: var(--rf-space-sm);
	}

	.tools select {
		font: inherit;
		font-size: 0.9rem;
		border: 1px solid var(--rf-color-border);
		border-radius: var(--rf-radius-md);
		background: var(--rf-color-surface);
		padding: 0.55rem 0.7rem;
	}

	.modal-actions {
		display: flex;
		gap: var(--rf-space-sm);
	}
</style>
