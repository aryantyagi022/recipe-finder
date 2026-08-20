<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { bindProps } from '$lib/actions/bindProps';
	import AddToPlanModal from '$lib/components/AddToPlanModal.svelte';
	import { getRecipeById } from '$lib/api/mealdb';
	import { favorites } from '$lib/state/favorites.svelte';
	import { planner } from '$lib/state/planner.svelte';
	import { isUserRecipeId, userRecipes } from '$lib/state/recipes.svelte';
	import type { Recipe, RecipeSummary } from '$lib/types';
	import { WEEK_DAYS, formatWeekRange } from '$lib/utils/date';

	let recipe = $state<Recipe | null>(null);
	let loading = $state(true);
	let error = $state('');
	let planning = $state(false);
	let confirmDelete = $state(false);

	const recipeId = $derived(page.params.id ?? '');

	const summary = $derived<RecipeSummary | null>(
		recipe
			? {
					id: recipe.id,
					title: recipe.title,
					image: recipe.image,
					category: recipe.category,
					area: recipe.area,
					origin: recipe.origin,
					tags: recipe.tags
				}
			: null
	);

	const plannedIn = $derived(recipe ? planner.slotsFor(recipe.id) : []);

	$effect(() => {
		const id = recipeId;
		untrack(() => load(id));
	});

	let requestId = 0;

	async function load(id: string) {
		const current = ++requestId;
		loading = true;
		error = '';
		recipe = null;

		if (!id) {
			loading = false;
			return;
		}

		if (isUserRecipeId(id)) {
			recipe = userRecipes.find(id);
			if (!recipe) error = 'This recipe no longer exists.';
			loading = false;
			return;
		}

		try {
			const found = await getRecipeById(id);
			if (current !== requestId) return;
			recipe = found;
			if (!recipe) error = 'We could not find that recipe.';
		} catch {
			if (current !== requestId) return;
			error = 'We could not reach the recipe service. Please try again.';
		} finally {
			if (current === requestId) loading = false;
		}
	}

	function removeRecipe() {
		if (!recipe) return;
		userRecipes.remove(recipe.id);
		favorites.remove(recipe.id);
		planner.removeRecipeEverywhere(recipe.id);
		confirmDelete = false;
		void goto('/my-recipes');
	}
</script>

<div class="page">
	{#if loading}
		<div class="spinner" role="status"><span class="sr-only">Loading recipe…</span></div>
	{:else if error || !recipe}
		<rf-empty-state
			use:bindProps={{ icon: '😕', heading: 'Recipe unavailable', message: error }}
		>
			<a class="btn btn-primary" href="/">Back to discovery</a>
		</rf-empty-state>
	{:else}
		<a class="back" href="/">← Back to recipes</a>

		<article class="detail">
			<header class="hero">
				<div class="media">
					{#if recipe.image}
						<img src={recipe.image} alt={recipe.title} />
					{:else}
						<div class="placeholder">🍽</div>
					{/if}
				</div>

				<div class="intro">
					<div class="tags">
						{#if recipe.category}
							<rf-tag use:bindProps={{ label: recipe.category, tone: 'accent' }}></rf-tag>
						{/if}
						{#if recipe.area}
							<rf-tag use:bindProps={{ label: recipe.area }}></rf-tag>
						{/if}
						{#if recipe.origin === 'user'}
							<rf-tag use:bindProps={{ label: 'My recipe', tone: 'success' }}></rf-tag>
						{/if}
					</div>

					<h1>{recipe.title}</h1>

					<dl class="facts">
						<div>
							<dt>Ingredients</dt>
							<dd>{recipe.ingredients.length}</dd>
						</div>
						<div>
							<dt>Steps</dt>
							<dd>{recipe.instructions.length}</dd>
						</div>
						{#if recipe.servings}
							<div>
								<dt>Serves</dt>
								<dd>{recipe.servings}</dd>
							</div>
						{/if}
						{#if recipe.cookTime}
							<div>
								<dt>Cook time</dt>
								<dd>{recipe.cookTime} min</dd>
							</div>
						{/if}
					</dl>

					<div class="actions">
						<button
							type="button"
							class="btn btn-primary"
							onclick={() => (planning = true)}
						>
							Add to meal plan
						</button>
						<button
							type="button"
							class="btn btn-secondary"
							onclick={() => summary && favorites.toggle(summary)}
						>
							{favorites.has(recipe.id) ? '♥ Saved' : '♡ Save to favorites'}
						</button>
						{#if recipe.origin === 'user'}
							<a class="btn btn-secondary" href={`/my-recipes/${recipe.id}/edit`}>Edit</a>
							<button
								type="button"
								class="btn btn-ghost"
								onclick={() => (confirmDelete = true)}
							>
								Delete
							</button>
						{/if}
					</div>

					{#if plannedIn.length > 0}
						<p class="planned">
							Planned for {plannedIn
								.map(
									(entry) =>
										`${WEEK_DAYS[entry.dayIndex]} ${entry.slot} (${formatWeekRange(entry.weekKey)})`
								)
								.join(', ')}
						</p>
					{/if}
				</div>
			</header>

			<div class="body">
				<section class="panel ingredients">
					<h2>Ingredients</h2>
					<ul>
						{#each recipe.ingredients as ingredient, index (index)}
							<li>
								<span>{ingredient.name}</span>
								<em>{ingredient.measure}</em>
							</li>
						{/each}
					</ul>
				</section>

				<section class="panel instructions">
					<h2>Instructions</h2>
					{#if recipe.instructions.length === 0}
						<p class="muted">No instructions were provided for this recipe.</p>
					{:else}
						<ol>
							{#each recipe.instructions as step, index (index)}
								<li>{step}</li>
							{/each}
						</ol>
					{/if}

					{#if recipe.tags.length > 0}
						<div class="tags">
							{#each recipe.tags as tag, index (index)}
								<rf-tag use:bindProps={{ label: tag }}></rf-tag>
							{/each}
						</div>
					{/if}

					{#if recipe.youtube || recipe.source}
						<div class="links">
							{#if recipe.youtube}
								<a href={recipe.youtube} target="_blank" rel="noreferrer">
									▶ Watch the video
								</a>
							{/if}
							{#if recipe.source}
								<a href={recipe.source} target="_blank" rel="noreferrer">
									Original source
								</a>
							{/if}
						</div>
					{/if}
				</section>
			</div>
		</article>
	{/if}
</div>

<AddToPlanModal recipe={planning ? summary : null} onclose={() => (planning = false)} />

<rf-modal
	use:bindProps={{ open: confirmDelete, heading: 'Delete recipe', size: 'sm' }}
	onrfClose={() => (confirmDelete = false)}
>
	<p>This will permanently remove the recipe, along with its favorite and planner entries.</p>
	<div slot="footer" class="modal-actions">
		<button type="button" class="btn btn-secondary" onclick={() => (confirmDelete = false)}>
			Cancel
		</button>
		<button type="button" class="btn btn-danger" onclick={removeRecipe}>Delete</button>
	</div>
</rf-modal>

<style>
	.back {
		display: inline-block;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--rf-color-text-muted);
		margin-bottom: var(--rf-space-md);
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
		gap: var(--rf-space-lg);
		align-items: start;
		margin-bottom: var(--rf-space-lg);
	}

	.media {
		border-radius: var(--rf-radius-lg);
		overflow: hidden;
		background: var(--rf-color-surface-muted);
		aspect-ratio: 4 / 3;
	}

	.media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.placeholder {
		display: grid;
		place-items: center;
		height: 100%;
		font-size: 3rem;
	}

	.intro h1 {
		font-size: 2rem;
		margin: var(--rf-space-sm) 0 var(--rf-space-md);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--rf-space-lg);
		margin: 0 0 var(--rf-space-lg);
	}

	.facts dt {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--rf-color-text-muted);
	}

	.facts dd {
		margin: 2px 0 0;
		font-size: 1.1rem;
		font-weight: 600;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--rf-space-sm);
	}

	.planned {
		margin: var(--rf-space-md) 0 0;
		font-size: 0.86rem;
		color: var(--rf-color-success);
	}

	.body {
		display: grid;
		grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
		gap: var(--rf-space-lg);
		align-items: start;
	}

	h2 {
		font-size: 1.1rem;
		margin-bottom: var(--rf-space-md);
	}

	.ingredients ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
	}

	.ingredients li {
		display: flex;
		justify-content: space-between;
		gap: var(--rf-space-md);
		padding: 0.5rem 0;
		border-bottom: 1px dashed var(--rf-color-border);
		font-size: 0.92rem;
	}

	.ingredients li:last-child {
		border-bottom: none;
	}

	.ingredients em {
		font-style: normal;
		color: var(--rf-color-text-muted);
		white-space: nowrap;
	}

	.instructions ol {
		margin: 0;
		padding-left: 1.15rem;
		display: grid;
		gap: var(--rf-space-md);
	}

	.instructions li {
		line-height: 1.65;
	}

	.instructions .tags {
		margin-top: var(--rf-space-lg);
	}

	.links {
		display: flex;
		gap: var(--rf-space-md);
		margin-top: var(--rf-space-lg);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.modal-actions {
		display: flex;
		gap: var(--rf-space-sm);
	}

	@media (max-width: 900px) {
		.hero,
		.body {
			grid-template-columns: 1fr;
		}
	}
</style>
