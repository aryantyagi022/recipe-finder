<script lang="ts">
	import { goto } from '$app/navigation';
	import { bindProps } from '$lib/actions/bindProps';
	import { favorites } from '$lib/state/favorites.svelte';
	import { ratings } from '$lib/state/ratings.svelte';
	import type { RecipeSummary } from '$lib/types';
	import type { RecipeCardData } from 'recipe-finder-ui';

	interface Props {
		recipes: RecipeSummary[];
		badgeFor?: (recipe: RecipeSummary) => string;
		onplan?: (recipe: RecipeSummary) => void;
		onremove?: (recipe: RecipeSummary) => void;
		removeLabel?: string;
	}

	let { recipes, badgeFor, onplan, onremove, removeLabel = 'Remove' }: Props = $props();

	function toCardData(recipe: RecipeSummary): RecipeCardData {
		return {
			id: recipe.id,
			title: recipe.title,
			image: recipe.image,
			category: recipe.category,
			area: recipe.area,
			tags: recipe.tags ?? [],
			source: recipe.origin
		};
	}

	function handleFavorite(recipe: RecipeSummary) {
		favorites.toggle(recipe);
	}
</script>

<div class="card-grid">
	{#each recipes as recipe (recipe.id)}
		<rf-recipe-card
			use:bindProps={{
				recipe: toCardData(recipe),
				favorite: favorites.has(recipe.id),
				badge: badgeFor?.(recipe) ?? (recipe.origin === 'user' ? 'Mine' : '')
			}}
			onrfSelect={() => goto(`/recipes/${recipe.id}`)}
			onrfFavoriteToggle={() => handleFavorite(recipe)}
		>
			<div slot="footer" class="actions">
				{#if ratings.get(recipe.id) > 0}
					<rf-rating
						use:bindProps={{
							value: ratings.get(recipe.id),
							readonly: true,
							label: `Your rating for ${recipe.title}`
						}}
					></rf-rating>
				{/if}
				{#if onplan}
					<button type="button" class="btn btn-secondary" onclick={() => onplan?.(recipe)}>
						Add to plan
					</button>
				{/if}
				{#if onremove}
					<button type="button" class="btn btn-ghost" onclick={() => onremove?.(recipe)}>
						{removeLabel}
					</button>
				{/if}
			</div>
		</rf-recipe-card>
	{/each}
</div>

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}

	.actions .btn {
		font-size: 0.8rem;
		padding: 0.4rem 0.7rem;
	}
</style>
