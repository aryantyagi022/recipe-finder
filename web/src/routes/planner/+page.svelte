<script lang="ts">
	import { goto } from '$app/navigation';
	import { bindProps } from '$lib/actions/bindProps';
	import { searchRecipes } from '$lib/api/mealdb';
	import { favorites } from '$lib/state/favorites.svelte';
	import { planner } from '$lib/state/planner.svelte';
	import { userRecipes } from '$lib/state/recipes.svelte';
	import type { MealSlot, RecipeSummary } from '$lib/types';
	import {
		MEAL_SLOTS,
		WEEK_DAYS,
		formatDay,
		formatWeekRange,
		isToday,
		weekDates
	} from '$lib/utils/date';

	let picking = $state<{ dayIndex: number; slot: MealSlot } | null>(null);
	let moving = $state<{ dayIndex: number; slot: MealSlot } | null>(null);
	let confirmClear = $state(false);
	let searchTerm = $state('');
	let searchResults = $state<RecipeSummary[]>([]);
	let searching = $state(false);

	const dates = $derived(weekDates(planner.weekKey));

	const mine = $derived(
		userRecipes.items.map<RecipeSummary>((recipe) => ({
			id: recipe.id,
			title: recipe.title,
			image: recipe.image,
			category: recipe.category,
			area: recipe.area,
			origin: 'user'
		}))
	);

	const localRecipes = $derived(
		[...mine, ...favorites.items].filter(
			(recipe, index, all) => all.findIndex((entry) => entry.id === recipe.id) === index
		)
	);

	const suggestions = $derived(searchTerm ? searchResults : localRecipes.slice(0, 12));

	async function runSearch(event: CustomEvent<string>) {
		searchTerm = event.detail;
		if (!searchTerm) {
			searchResults = [];
			return;
		}
		searching = true;
		try {
			const apiResults = await searchRecipes(searchTerm);
			const local = localRecipes.filter((recipe) =>
				recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
			);
			const seen = new Set(local.map((recipe) => recipe.id));
			searchResults = [...local, ...apiResults.filter((recipe) => !seen.has(recipe.id))];
		} catch {
			searchResults = [];
		} finally {
			searching = false;
		}
	}

	function openPicker(dayIndex: number, slot: MealSlot) {
		picking = { dayIndex, slot };
		moving = null;
	}

	function closePicker() {
		picking = null;
		searchTerm = '';
		searchResults = [];
	}

	function assign(recipe: RecipeSummary) {
		if (!picking) return;
		planner.assign(picking.dayIndex, picking.slot, recipe);
		closePicker();
	}

	function handleCellClick(dayIndex: number, slot: MealSlot) {
		if (moving) {
			planner.move(moving, { dayIndex, slot });
			moving = null;
			return;
		}
		openPicker(dayIndex, slot);
	}

	function toggleMove(dayIndex: number, slot: MealSlot) {
		moving =
			moving && moving.dayIndex === dayIndex && moving.slot === slot ? null : { dayIndex, slot };
	}
</script>

<div class="page">
	<header class="page-header">
		<div>
			<h1>Weekly meal planner</h1>
			<p>
				{planner.plannedCount} of 21 slots planned for {formatWeekRange(planner.weekKey)}.
			</p>
		</div>

		<div class="tools">
			<button type="button" class="btn btn-secondary" onclick={() => planner.goToWeek(-1)}>
				‹ Previous
			</button>
			<button type="button" class="btn btn-secondary" onclick={() => planner.goToCurrentWeek()}>
				This week
			</button>
			<button type="button" class="btn btn-secondary" onclick={() => planner.goToWeek(1)}>
				Next ›
			</button>
			{#if planner.plannedCount > 0}
				<button type="button" class="btn btn-ghost" onclick={() => (confirmClear = true)}>
					Clear week
				</button>
			{/if}
		</div>
	</header>

	{#if moving}
		<p class="hint">
			Pick an empty slot to move <strong>{planner.meal(moving.dayIndex, moving.slot)?.title}</strong
			>, or
			<button type="button" class="link" onclick={() => (moving = null)}>cancel</button>.
		</p>
	{/if}

	<div class="board">
		{#each WEEK_DAYS as day, dayIndex (day)}
			<section class="day" class:today={isToday(dates[dayIndex])}>
				<header>
					<div>
						<h2>{day}</h2>
						<span class="date">{formatDay(dates[dayIndex])}</span>
					</div>
					<button
						type="button"
						class="btn btn-ghost clear-day"
						onclick={() => planner.clearDay(dayIndex)}
					>
						Clear
					</button>
				</header>

				{#each MEAL_SLOTS as slot (slot)}
					{@const meal = planner.meal(dayIndex, slot)}
					<div
						class="slot"
						class:filled={Boolean(meal)}
						class:moving={moving?.dayIndex === dayIndex && moving?.slot === slot}
					>
						<span class="slot-label">{slot}</span>

						{#if meal}
							<div class="meal">
								{#if meal.image}
									<img src={meal.image} alt="" />
								{/if}
								<button
									type="button"
									class="title"
									onclick={() => goto(`/recipes/${meal.recipeId}`)}
								>
									{meal.title}
								</button>
							</div>
							<div class="slot-actions">
								<button type="button" onclick={() => toggleMove(dayIndex, slot)}>
									{moving?.dayIndex === dayIndex && moving?.slot === slot
										? 'Cancel'
										: 'Move'}
								</button>
								<button type="button" onclick={() => openPicker(dayIndex, slot)}>
									Replace
								</button>
								<button type="button" onclick={() => planner.remove(dayIndex, slot)}>
									Remove
								</button>
							</div>
						{:else}
							<button
								type="button"
								class="add"
								onclick={() => handleCellClick(dayIndex, slot)}
							>
								{moving ? 'Move here' : '+ Add meal'}
							</button>
						{/if}
					</div>
				{/each}
			</section>
		{/each}
	</div>
</div>

<rf-modal
	use:bindProps={{
		open: Boolean(picking),
		heading: picking ? `Plan ${WEEK_DAYS[picking.dayIndex]} ${picking.slot}` : '',
		size: 'md'
	}}
	onrfClose={closePicker}
>
	<rf-search-bar
		use:bindProps={{ placeholder: 'Search recipes to plan', debounce: 400 }}
		onrfSearch={runSearch}
	></rf-search-bar>

	{#if searching}
		<div class="spinner"></div>
	{:else if suggestions.length === 0}
		<p class="muted empty-note">
			No matching recipes. Try another search term or add one of your own recipes first.
		</p>
	{:else}
		<ul class="suggestions">
			{#each suggestions as recipe (recipe.id)}
				<li>
					<button type="button" onclick={() => assign(recipe)}>
						{#if recipe.image}
							<img src={recipe.image} alt="" />
						{:else}
							<span class="thumb-placeholder">🍽</span>
						{/if}
						<span class="info">
							<strong>{recipe.title}</strong>
							<small>{[recipe.category, recipe.area].filter(Boolean).join(' · ')}</small>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div slot="footer" class="modal-actions">
		<button type="button" class="btn btn-secondary" onclick={closePicker}>Close</button>
	</div>
</rf-modal>

<rf-modal
	use:bindProps={{ open: confirmClear, heading: 'Clear this week', size: 'sm' }}
	onrfClose={() => (confirmClear = false)}
>
	<p>Remove all {planner.plannedCount} planned meals from {formatWeekRange(planner.weekKey)}?</p>
	<div slot="footer" class="modal-actions">
		<button type="button" class="btn btn-secondary" onclick={() => (confirmClear = false)}>
			Cancel
		</button>
		<button
			type="button"
			class="btn btn-danger"
			onclick={() => {
				planner.clearWeek();
				confirmClear = false;
			}}
		>
			Clear week
		</button>
	</div>
</rf-modal>

<style>
	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.hint {
		background: var(--rf-color-accent-soft);
		color: var(--rf-color-accent);
		border-radius: var(--rf-radius-md);
		padding: 0.7rem 1rem;
		font-size: 0.88rem;
		margin: 0 0 var(--rf-space-md);
	}

	.link {
		border: none;
		background: none;
		padding: 0;
		font: inherit;
		color: inherit;
		text-decoration: underline;
		cursor: pointer;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
		gap: var(--rf-space-md);
		align-items: start;
	}

	.day {
		background: var(--rf-color-surface);
		border: 1px solid var(--rf-color-border);
		border-radius: var(--rf-radius-lg);
		padding: var(--rf-space-md);
		display: grid;
		gap: var(--rf-space-sm);
	}

	.day.today {
		border-color: var(--rf-color-accent);
		box-shadow: 0 0 0 3px var(--rf-color-accent-soft);
	}

	.day > header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--rf-space-sm);
	}

	.day h2 {
		font-size: 0.95rem;
	}

	.date {
		font-size: 0.75rem;
		color: var(--rf-color-text-muted);
	}

	.clear-day {
		font-size: 0.72rem;
		padding: 0.2rem 0.45rem;
	}

	.slot {
		border: 1px dashed var(--rf-color-border);
		border-radius: var(--rf-radius-md);
		padding: var(--rf-space-sm);
		display: grid;
		gap: 6px;
	}

	.slot.filled {
		border-style: solid;
		background: var(--rf-color-surface-muted);
	}

	.slot.moving {
		border-color: var(--rf-color-accent);
		background: var(--rf-color-accent-soft);
	}

	.slot-label {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 700;
		color: var(--rf-color-text-muted);
	}

	.meal {
		display: flex;
		align-items: center;
		gap: var(--rf-space-sm);
	}

	.meal img {
		width: 38px;
		height: 38px;
		border-radius: var(--rf-radius-sm);
		object-fit: cover;
		flex-shrink: 0;
	}

	.title {
		border: none;
		background: none;
		padding: 0;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		text-align: left;
		color: var(--rf-color-text);
		cursor: pointer;
		line-height: 1.3;
	}

	.title:hover {
		color: var(--rf-color-accent);
	}

	.slot-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.slot-actions button {
		border: none;
		background: none;
		padding: 0;
		font: inherit;
		font-size: 0.75rem;
		color: var(--rf-color-text-muted);
		cursor: pointer;
	}

	.slot-actions button:hover {
		color: var(--rf-color-accent);
	}

	.add {
		border: none;
		background: none;
		padding: 0.35rem 0;
		font: inherit;
		font-size: 0.82rem;
		color: var(--rf-color-text-muted);
		cursor: pointer;
		text-align: left;
	}

	.add:hover {
		color: var(--rf-color-accent);
	}

	.suggestions {
		list-style: none;
		margin: var(--rf-space-md) 0 0;
		padding: 0;
		display: grid;
		gap: 4px;
		max-height: 340px;
		overflow-y: auto;
	}

	.suggestions button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--rf-space-sm);
		border: 1px solid transparent;
		background: none;
		border-radius: var(--rf-radius-md);
		padding: 0.5rem;
		font: inherit;
		cursor: pointer;
		text-align: left;
	}

	.suggestions button:hover {
		border-color: var(--rf-color-accent);
		background: var(--rf-color-accent-soft);
	}

	.suggestions img,
	.thumb-placeholder {
		width: 44px;
		height: 44px;
		border-radius: var(--rf-radius-sm);
		object-fit: cover;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		background: var(--rf-color-surface-muted);
	}

	.info {
		display: grid;
	}

	.info strong {
		font-size: 0.9rem;
	}

	.info small {
		color: var(--rf-color-text-muted);
		font-size: 0.76rem;
	}

	.empty-note {
		margin-top: var(--rf-space-md);
		font-size: 0.88rem;
	}

	.modal-actions {
		display: flex;
		gap: var(--rf-space-sm);
	}
</style>
