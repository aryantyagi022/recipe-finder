<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import '../app.css';

	let { children } = $props();

	onMount(async () => {
		const { defineCustomElements } = await import('recipe-finder-ui/components');
		defineCustomElements();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Recipe Finder &amp; Meal Planner</title>
</svelte:head>

<SiteHeader />

<main>
	{@render children()}
</main>

<footer>
	<div>
		Recipe data from <a href="https://www.themealdb.com" target="_blank" rel="noreferrer">TheMealDB</a>
		· UI powered by
		<a href="https://www.npmjs.com/package/recipe-finder-ui" target="_blank" rel="noreferrer">
			recipe-finder-ui
		</a>
	</div>
</footer>

<style>
	main {
		min-height: calc(100vh - 66px - 72px);
	}

	footer {
		border-top: 1px solid var(--rf-color-border);
		background: var(--rf-color-surface);
		padding: var(--rf-space-lg) var(--rf-space-md);
		font-size: 0.85rem;
		color: var(--rf-color-text-muted);
	}

	footer div {
		max-width: var(--page-max);
		margin: 0 auto;
	}
</style>
