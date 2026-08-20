<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { bindProps } from '$lib/actions/bindProps';
	import AddToPlanModal from '$lib/components/AddToPlanModal.svelte';
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { discover, getRandomRecipe, listAreas, listCategories } from '$lib/api/mealdb';
	import { userRecipes } from '$lib/state/recipes.svelte';
	import type { RecipeSummary } from '$lib/types';
	import type { FilterGroup } from 'recipe-finder-ui';

	const PAGE_SIZE = 12;

	let term = $state(page.url.searchParams.get('q') ?? '');
	let category = $state(page.url.searchParams.get('category') ?? '');
	let area = $state(page.url.searchParams.get('area') ?? '');
	let includeMine = $state(true);

	let categories = $state<string[]>([]);
	let areas = $state<string[]>([]);
	let results = $state<RecipeSummary[]>([]);
	let loading = $state(true);
	let error = $state('');
	let visible = $state(PAGE_SIZE);
	let planningRecipe = $state<RecipeSummary | null>(null);

	const filterGroups = $derived<FilterGroup[]>([
		{
			id: 'category',
			label: 'Category',
			options: categories.map((value) => ({ value, label: value }))
		},
		{ id: 'area', label: 'Cuisine', options: areas.map((value) => ({ value, label: value })) }
	]);

	const mine = $derived(
		userRecipes.items
			.filter((recipe) => {
				const matchesTerm = !term || recipe.title.toLowerCase().includes(term.toLowerCase());
				const matchesCategory = !category || recipe.category === category;
				const matchesArea = !area || recipe.area === area;
				return matchesTerm && matchesCategory && matchesArea;
			})
			.map<RecipeSummary>((recipe) => ({
				id: recipe.id,
				title: recipe.title,
				image: recipe.image,
				category: recipe.category,
				area: recipe.area,
				origin: 'user',
				tags: recipe.tags
			}))
	);

	const combined = $derived(includeMine ? [...mine, ...results] : results);
	const shown = $derived(combined.slice(0, visible));

	$effect(() => {
		untrack(() => loadFilters());
	});

	$effect(() => {
		const params = { term, category, area };
		untrack(() => {
			visible = PAGE_SIZE;
			void load(params);
			syncUrl(params);
		});
	});

	async function loadFilters() {
		try {
			const [categoryList, areaList] = await Promise.all([listCategories(), listAreas()]);
			categories = categoryList;
			areas = areaList;
		} catch {
			error = 'Could not load filter options.';
		}
	}

	let requestId = 0;

	async function load(params: { term: string; category: string; area: string }) {
		const current = ++requestId;
		loading = true;
		error = '';
		try {
			const found = await discover(params);
			if (current !== requestId) return;
			results = found;
		} catch {
			if (current !== requestId) return;
			results = [];
			error = 'We could not reach the recipe service. Please try again.';
		} finally {
			if (current === requestId) loading = false;
		}
	}

	function syncUrl(params: { term: string; category: string; area: string }) {
		const search = new URLSearchParams();
		if (params.term) search.set('q', params.term);
		if (params.category) search.set('category', params.category);
		if (params.area) search.set('area', params.area);
		const query = search.toString();
		const next = query ? `/?${query}` : '/';
		if (next !== `${page.url.pathname}${page.url.search}`) {
			void goto(next, { replaceState: true, keepFocus: true, noScroll: true });
		}
	}

	function handleFilterChange(event: CustomEvent<{ group: string; value: string }>) {
		if (event.detail.group === 'category') category = event.detail.value;
		if (event.detail.group === 'area') area = event.detail.value;
	}

	function resetFilters() {
		category = '';
		area = '';
	}

	async function surpriseMe() {
		try {
			const recipe = await getRandomRecipe();
			if (recipe) await goto(`/recipes/${recipe.id}`);
		} catch {
			error = 'Could not fetch a random recipe.';
		}
	}
</script>

<div class="page">
	<section class="hero">
		<div>
			<h1>Find your next favourite meal</h1>
			<p>
				Search thousands of recipes, save the ones you love and turn them into a weekly meal
				plan.
			</p>
		</div>
		<button type="button" class="btn btn-secondary" onclick={surpriseMe}>🎲 Surprise me</button>
	</section>

	<div class="controls panel">
		<rf-search-bar
			use:bindProps={{
				value: term,
				placeholder: 'Search by name, e.g. "chicken"',
				label: 'Search recipes',
				debounce: 400
			}}
			onrfSearch={(event: CustomEvent<string>) => (term = event.detail)}
		></rf-search-bar>

		<rf-filter-bar
			use:bindProps={{ groups: filterGroups, selected: { category, area } }}
			onrfFilterChange={handleFilterChange}
			onrfFilterReset={resetFilters}
		>
			<label class="mine-toggle">
				<input type="checkbox" bind:checked={includeMine} />
				Include my recipes
			</label>
		</rf-filter-bar>
	</div>

	{#if error}
		<p class="alert" role="alert">{error}</p>
	{/if}

	{#if loading}
		<div class="spinner" role="status"><span class="sr-only">Loading recipes…</span></div>
	{:else if combined.length === 0}
		<rf-empty-state
			use:bindProps={{
				icon: '🔍',
				heading: 'No recipes matched your search',
				message: 'Try a different keyword or clear the filters to see more results.'
			}}
		>
			<button type="button" class="btn btn-secondary" onclick={resetFilters}>
				Clear filters
			</button>
		</rf-empty-state>
	{:else}
		<div class="results-head">
			<h2>{combined.length} recipe{combined.length === 1 ? '' : 's'}</h2>
			<span class="muted">Showing {shown.length}</span>
		</div>

		<RecipeGrid recipes={shown} onplan={(recipe) => (planningRecipe = recipe)} />

		{#if visible < combined.length}
			<div class="more">
				<button type="button" class="btn btn-primary" onclick={() => (visible += PAGE_SIZE)}>
					Load more
				</button>
			</div>
		{/if}
	{/if}
</div>

<AddToPlanModal recipe={planningRecipe} onclose={() => (planningRecipe = null)} />

<style>
	.hero {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--rf-space-md);
		margin-bottom: var(--rf-space-lg);
	}

	.hero h1 {
		font-size: 1.9rem;
	}

	.hero p {
		margin: 6px 0 0;
		color: var(--rf-color-text-muted);
		max-width: 54ch;
	}

	.controls {
		display: grid;
		gap: var(--rf-space-md);
		margin-bottom: var(--rf-space-lg);
	}

	.mine-toggle {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		color: var(--rf-color-text-muted);
		white-space: nowrap;
	}

	.results-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: var(--rf-space-md);
	}

	.results-head h2 {
		font-size: 1.05rem;
	}

	.more {
		display: flex;
		justify-content: center;
		margin-top: var(--rf-space-lg);
	}
</style>
