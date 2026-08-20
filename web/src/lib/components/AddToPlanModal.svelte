<script lang="ts">
	import { bindProps } from '$lib/actions/bindProps';
	import { planner } from '$lib/state/planner.svelte';
	import type { MealSlot, RecipeSummary } from '$lib/types';
	import { MEAL_SLOTS, WEEK_DAYS, formatDay, formatWeekRange, shiftWeek, weekDates } from '$lib/utils/date';

	interface Props {
		recipe: RecipeSummary | null;
		onclose: () => void;
	}

	let { recipe, onclose }: Props = $props();

	let dayIndex = $state(0);
	let slot = $state<MealSlot>('dinner');
	let confirmation = $state('');
	let weekKey = $state(planner.weekKey);

	const dates = $derived(weekDates(weekKey));
	const occupying = $derived(planner.mealIn(weekKey, dayIndex, slot));

	$effect(() => {
		if (recipe) {
			confirmation = '';
			weekKey = planner.weekKey;
		}
	});

	function assign() {
		if (!recipe) return;
		planner.assignTo(weekKey, dayIndex, slot, recipe);
		confirmation = `${recipe.title} planned for ${WEEK_DAYS[dayIndex]} ${slot}, ${formatWeekRange(weekKey)}.`;
	}
</script>

<rf-modal
	use:bindProps={{ open: Boolean(recipe), heading: 'Add to meal plan', size: 'sm' }}
	onrfClose={onclose}
>
	{#if recipe}
		<p class="lead">
			Planning <strong>{recipe.title}</strong> for the week of {formatWeekRange(weekKey)}.
		</p>

		<div class="field" role="group" aria-labelledby="plan-week-label">
			<span id="plan-week-label">Week</span>
			<div class="week-nav">
				<button
					type="button"
					class="btn btn-secondary"
					aria-label="Previous week"
					onclick={() => (weekKey = shiftWeek(weekKey, -1))}
				>
					‹
				</button>
				<span>{formatWeekRange(weekKey)}</span>
				<button
					type="button"
					class="btn btn-secondary"
					aria-label="Next week"
					onclick={() => (weekKey = shiftWeek(weekKey, 1))}
				>
					›
				</button>
			</div>
		</div>

		<div class="row">
			<div class="field">
				<label for="plan-day">Day</label>
				<select id="plan-day" bind:value={dayIndex}>
					{#each WEEK_DAYS as day, index (day)}
						<option value={index}>{day} · {formatDay(dates[index])}</option>
					{/each}
				</select>
			</div>

			<div class="field">
				<label for="plan-slot">Meal</label>
				<select id="plan-slot" bind:value={slot}>
					{#each MEAL_SLOTS as mealSlot (mealSlot)}
						<option value={mealSlot}>{mealSlot}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if occupying}
			<p class="warning">
				{WEEK_DAYS[dayIndex]} {slot} already has
				<strong>{occupying.title}</strong> — saving will replace it.
			</p>
		{/if}

		{#if confirmation}
			<p class="confirmation">{confirmation}</p>
		{/if}
	{/if}

	<div slot="footer" class="footer">
		<button type="button" class="btn btn-secondary" onclick={onclose}>Close</button>
		<button type="button" class="btn btn-primary" onclick={assign}>Save to plan</button>
	</div>
</rf-modal>

<style>
	.lead {
		margin-top: 0;
		color: var(--rf-color-text-muted);
		font-size: 0.92rem;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--rf-space-md);
		margin-top: var(--rf-space-md);
	}

	.week-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--rf-space-sm);
		border: 1px solid var(--rf-color-border);
		border-radius: var(--rf-radius-md);
		padding: 4px;
		font-size: 0.88rem;
	}

	.week-nav .btn {
		padding: 0.25rem 0.65rem;
	}

	.warning {
		margin: var(--rf-space-md) 0 0;
		font-size: 0.85rem;
		color: var(--rf-color-warning);
	}

	.confirmation {
		margin: var(--rf-space-md) 0 0;
		font-size: 0.85rem;
		color: var(--rf-color-success);
	}

	.footer {
		display: flex;
		gap: var(--rf-space-sm);
	}

	select {
		text-transform: capitalize;
	}

	@media (max-width: 520px) {
		.row {
			grid-template-columns: 1fr;
		}
	}
</style>
