<script lang="ts">
	import { untrack } from 'svelte';
	import { bindProps } from '$lib/actions/bindProps';
	import type { Recipe } from '$lib/types';
	import {
		emptyDraft,
		isValid,
		validateRecipe,
		type RecipeDraft,
		type RecipeErrors
	} from '$lib/validation/recipe';

	interface Props {
		initial?: Recipe | null;
		submitLabel?: string;
		onsubmit: (draft: RecipeDraft) => void;
		oncancel: () => void;
	}

	let { initial = null, submitLabel = 'Save recipe', onsubmit, oncancel }: Props = $props();

	const CATEGORIES = [
		'Beef',
		'Breakfast',
		'Chicken',
		'Dessert',
		'Goat',
		'Lamb',
		'Miscellaneous',
		'Pasta',
		'Pork',
		'Seafood',
		'Side',
		'Starter',
		'Vegan',
		'Vegetarian'
	];

	function fromRecipe(recipe: Recipe): RecipeDraft {
		return {
			title: recipe.title,
			category: recipe.category,
			area: recipe.area,
			image: recipe.image,
			servings: recipe.servings ?? 2,
			cookTime: recipe.cookTime ?? 30,
			tags: recipe.tags.join(', '),
			youtube: recipe.youtube ?? '',
			ingredients: recipe.ingredients.length
				? recipe.ingredients.map((item) => ({ ...item }))
				: [{ name: '', measure: '' }],
			instructions: recipe.instructions.length ? [...recipe.instructions] : ['']
		};
	}

	let draft = $state<RecipeDraft>(
		untrack(() => (initial ? fromRecipe(initial) : emptyDraft()))
	);
	let errors = $state<RecipeErrors>({});
	let submitted = $state(false);

	const liveErrors = $derived(submitted ? validateRecipe(draft) : errors);

	function addIngredient() {
		draft.ingredients = [...draft.ingredients, { name: '', measure: '' }];
	}

	function removeIngredient(index: number) {
		draft.ingredients = draft.ingredients.filter((_, position) => position !== index);
		if (draft.ingredients.length === 0) addIngredient();
	}

	function addStep() {
		draft.instructions = [...draft.instructions, ''];
	}

	function removeStep(index: number) {
		draft.instructions = draft.instructions.filter((_, position) => position !== index);
		if (draft.instructions.length === 0) addStep();
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		errors = validateRecipe(draft);
		if (isValid(errors)) {
			onsubmit(draft);
		}
	}
</script>

<form class="panel" onsubmit={handleSubmit} novalidate>
	<section>
		<h2>Basics</h2>
		<div class="grid">
			<div class="field" class:invalid={liveErrors.title}>
				<label for="title">Title *</label>
				<input id="title" bind:value={draft.title} placeholder="Creamy tomato pasta" />
				{#if liveErrors.title}<span class="error">{liveErrors.title}</span>{/if}
			</div>

			<div class="field" class:invalid={liveErrors.category}>
				<label for="category">Category *</label>
				<select id="category" bind:value={draft.category}>
					<option value="">Select a category</option>
					{#each CATEGORIES as option (option)}
						<option value={option}>{option}</option>
					{/each}
				</select>
				{#if liveErrors.category}<span class="error">{liveErrors.category}</span>{/if}
			</div>

			<div class="field">
				<label for="area">Cuisine</label>
				<input id="area" bind:value={draft.area} placeholder="Italian" />
			</div>

			<div class="field" class:invalid={liveErrors.image}>
				<label for="image">Image URL</label>
				<input id="image" bind:value={draft.image} placeholder="https://…" />
				{#if liveErrors.image}<span class="error">{liveErrors.image}</span>{/if}
			</div>

			<div class="field" class:invalid={liveErrors.servings}>
				<label for="servings">Servings *</label>
				<input id="servings" type="number" min="1" max="50" bind:value={draft.servings} />
				{#if liveErrors.servings}<span class="error">{liveErrors.servings}</span>{/if}
			</div>

			<div class="field" class:invalid={liveErrors.cookTime}>
				<label for="cookTime">Cook time (minutes) *</label>
				<input id="cookTime" type="number" min="1" max="1440" bind:value={draft.cookTime} />
				{#if liveErrors.cookTime}<span class="error">{liveErrors.cookTime}</span>{/if}
			</div>

			<div class="field">
				<label for="tags">Tags</label>
				<input id="tags" bind:value={draft.tags} placeholder="Comfort, Quick, Family" />
			</div>

			<div class="field" class:invalid={liveErrors.youtube}>
				<label for="youtube">Video link</label>
				<input id="youtube" bind:value={draft.youtube} placeholder="https://youtube.com/…" />
				{#if liveErrors.youtube}<span class="error">{liveErrors.youtube}</span>{/if}
			</div>
		</div>

		{#if draft.image}
			<div class="preview">
				<img src={draft.image} alt="Recipe preview" />
			</div>
		{/if}
	</section>

	<section>
		<div class="section-head">
			<h2>Ingredients *</h2>
			<button type="button" class="btn btn-secondary" onclick={addIngredient}>
				Add ingredient
			</button>
		</div>

		{#if liveErrors.ingredients}
			<p class="error">{liveErrors.ingredients}</p>
		{/if}

		<div class="rows">
			{#each draft.ingredients as ingredient, index (index)}
				<div class="row">
					<input
						bind:value={ingredient.name}
						placeholder="Ingredient"
						aria-label={`Ingredient ${index + 1} name`}
					/>
					<input
						bind:value={ingredient.measure}
						placeholder="Quantity"
						aria-label={`Ingredient ${index + 1} quantity`}
					/>
					<button
						type="button"
						class="btn btn-ghost"
						aria-label={`Remove ingredient ${index + 1}`}
						onclick={() => removeIngredient(index)}
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<div class="section-head">
			<h2>Instructions *</h2>
			<button type="button" class="btn btn-secondary" onclick={addStep}>Add step</button>
		</div>

		{#if liveErrors.instructions}
			<p class="error">{liveErrors.instructions}</p>
		{/if}

		<div class="rows">
			{#each draft.instructions as _, index (index)}
				<div class="row step">
					<span class="step-index">{index + 1}</span>
					<textarea
						bind:value={draft.instructions[index]}
						rows="2"
						placeholder="Describe this step"
						aria-label={`Step ${index + 1}`}
					></textarea>
					<button
						type="button"
						class="btn btn-ghost"
						aria-label={`Remove step ${index + 1}`}
						onclick={() => removeStep(index)}
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	</section>

	<footer>
		{#if submitted && !isValid(liveErrors)}
			<rf-tag use:bindProps={{ label: 'Please fix the highlighted fields', tone: 'warning' }}
			></rf-tag>
		{/if}
		<div class="footer-actions">
			<button type="button" class="btn btn-secondary" onclick={oncancel}>Cancel</button>
			<button type="submit" class="btn btn-primary">{submitLabel}</button>
		</div>
	</footer>
</form>

<style>
	form {
		display: grid;
		gap: var(--rf-space-lg);
	}

	h2 {
		font-size: 1.05rem;
		margin-bottom: var(--rf-space-md);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
		gap: var(--rf-space-md);
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--rf-space-md);
		margin-bottom: var(--rf-space-md);
	}

	.section-head h2 {
		margin-bottom: 0;
	}

	.rows {
		display: grid;
		gap: var(--rf-space-sm);
	}

	.row {
		display: grid;
		grid-template-columns: 2fr 1fr auto;
		gap: var(--rf-space-sm);
		align-items: start;
	}

	.row.step {
		grid-template-columns: auto 1fr auto;
	}

	.step-index {
		width: 28px;
		height: 38px;
		display: grid;
		place-items: center;
		font-weight: 700;
		color: var(--rf-color-text-muted);
	}

	.row input,
	.row textarea {
		font: inherit;
		border: 1px solid var(--rf-color-border);
		border-radius: var(--rf-radius-md);
		padding: 0.55rem 0.7rem;
		outline: none;
		resize: vertical;
		width: 100%;
	}

	.row input:focus,
	.row textarea:focus {
		border-color: var(--rf-color-accent);
		box-shadow: 0 0 0 3px var(--rf-color-accent-soft);
	}

	.error {
		color: var(--rf-color-danger);
		font-size: 0.8rem;
	}

	.preview {
		margin-top: var(--rf-space-md);
		width: 190px;
		aspect-ratio: 4 / 3;
		border-radius: var(--rf-radius-md);
		overflow: hidden;
		background: var(--rf-color-surface-muted);
	}

	.preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--rf-space-md);
		border-top: 1px solid var(--rf-color-border);
		padding-top: var(--rf-space-lg);
	}

	.footer-actions {
		display: flex;
		gap: var(--rf-space-sm);
		margin-left: auto;
	}

	@media (max-width: 620px) {
		.row {
			grid-template-columns: 1fr auto;
		}

		.row.step {
			grid-template-columns: 1fr auto;
		}

		.step-index {
			display: none;
		}
	}
</style>
