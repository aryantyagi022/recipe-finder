<script lang="ts">
	import { page } from '$app/state';
	import { favorites } from '$lib/state/favorites.svelte';
	import { userRecipes } from '$lib/state/recipes.svelte';
	import { planner } from '$lib/state/planner.svelte';

	const links = [
		{ href: '/', label: 'Discover' },
		{ href: '/my-recipes', label: 'My recipes' },
		{ href: '/favorites', label: 'Favorites' },
		{ href: '/planner', label: 'Planner' }
	];

	const counts = $derived<Record<string, number>>({
		'/my-recipes': userRecipes.count,
		'/favorites': favorites.count,
		'/planner': planner.totalPlannedCount
	});

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	let menuOpen = $state(false);
</script>

<header>
	<div class="inner">
		<a class="brand" href="/" onclick={() => (menuOpen = false)}>
			<span class="mark">🍳</span>
			<span>
				<strong>Recipe Finder</strong>
				<small>&amp; Meal Planner</small>
			</span>
		</a>

		<button
			class="toggle"
			aria-expanded={menuOpen}
			aria-label="Toggle navigation"
			onclick={() => (menuOpen = !menuOpen)}
		>
			☰
		</button>

		<nav class:open={menuOpen}>
			{#each links as link (link.href)}
				<a
					href={link.href}
					class:active={isActive(link.href)}
					onclick={() => (menuOpen = false)}
				>
					{link.label}
					{#if counts[link.href]}
						<span class="count">{counts[link.href]}</span>
					{/if}
				</a>
			{/each}
			<a class="cta" href="/my-recipes/new" onclick={() => (menuOpen = false)}>Add recipe</a>
		</nav>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid var(--rf-color-border);
	}

	.inner {
		max-width: var(--page-max);
		margin: 0 auto;
		padding: 0 var(--rf-space-md);
		height: 66px;
		display: flex;
		align-items: center;
		gap: var(--rf-space-lg);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--rf-color-text);
		text-decoration: none;
	}

	.brand:hover {
		text-decoration: none;
	}

	.mark {
		font-size: 1.6rem;
	}

	.brand strong {
		display: block;
		font-size: 1rem;
		line-height: 1.1;
	}

	.brand small {
		display: block;
		font-size: 0.72rem;
		color: var(--rf-color-text-muted);
	}

	nav {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 0.5rem 0.85rem;
		border-radius: var(--rf-radius-md);
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--rf-color-text-muted);
	}

	nav a:hover {
		color: var(--rf-color-text);
		background: var(--rf-color-surface-muted);
		text-decoration: none;
	}

	nav a.active {
		color: var(--rf-color-accent);
		background: var(--rf-color-accent-soft);
	}

	.count {
		background: var(--rf-color-accent);
		color: #fff;
		font-size: 0.68rem;
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		border-radius: 999px;
		display: inline-grid;
		place-items: center;
	}

	nav a.cta {
		margin-left: var(--rf-space-sm);
		background: var(--rf-color-accent);
		color: #fff;
	}

	nav a.cta:hover {
		background: #cf4d09;
		color: #fff;
	}

	.toggle {
		display: none;
		margin-left: auto;
		border: 1px solid var(--rf-color-border);
		background: var(--rf-color-surface);
		border-radius: var(--rf-radius-md);
		font-size: 1.1rem;
		padding: 0.35rem 0.6rem;
		cursor: pointer;
	}

	@media (max-width: 760px) {
		.toggle {
			display: block;
		}

		nav {
			display: none;
			position: absolute;
			top: 66px;
			left: 0;
			right: 0;
			flex-direction: column;
			align-items: stretch;
			background: var(--rf-color-surface);
			border-bottom: 1px solid var(--rf-color-border);
			padding: var(--rf-space-sm);
			gap: 2px;
		}

		nav.open {
			display: flex;
		}

		nav a.cta {
			margin-left: 0;
			justify-content: center;
		}
	}
</style>
