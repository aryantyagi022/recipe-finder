import { describe, expect, it, render } from '@stencil/vitest';
import type { RecipeCardData } from '../../types';

const settle = async (root: HTMLElement, selector: string) => {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (root.shadowRoot?.querySelector(selector)) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error(`timed out waiting for ${selector}`);
};

const recipe: RecipeCardData = {
  id: '52772',
  title: 'Teriyaki Chicken Casserole',
  image: 'https://example.test/teriyaki.jpg',
  category: 'Chicken',
  area: 'Japanese',
  tags: ['Meat', 'Casserole'],
};

describe('rf-recipe-card', () => {
  it('renders the title and a combined meta line', async () => {
    const { root } = await render('<rf-recipe-card></rf-recipe-card>', {});
    (root as any).recipe = recipe;
    await settle(root, '.card');

    expect(root.shadowRoot.querySelector('h3').textContent).toBe(recipe.title);
    expect(root.shadowRoot.querySelector('.meta').textContent).toBe('Chicken · Japanese');
  });

  it('emits rfSelect with the recipe payload', async () => {
    const { root, spyOnEvent } = await render('<rf-recipe-card></rf-recipe-card>', {});
    (root as any).recipe = recipe;
    await settle(root, '.card');

    const selected = spyOnEvent('rfSelect');
    root.shadowRoot.querySelector<HTMLElement>('.card').click();

    expect(selected.length).toBe(1);
    expect(selected.lastEvent.detail).toEqual(recipe);
  });

  it('inverts the favorite state without triggering a select', async () => {
    const { root, spyOnEvent } = await render('<rf-recipe-card favorite="true"></rf-recipe-card>', {});
    (root as any).recipe = recipe;
    await settle(root, '.card');

    const toggled = spyOnEvent('rfFavoriteToggle');
    const selected = spyOnEvent('rfSelect');
    root.shadowRoot.querySelector<HTMLElement>('.fav').click();

    expect(toggled.lastEvent.detail.favorite).toBe(false);
    expect(selected.length).toBe(0);
  });

  it('projects footer content through the named slot', async () => {
    const { root } = await render('<rf-recipe-card><rf-tag slot="footer" label="30 min"></rf-tag></rf-recipe-card>', {});
    (root as any).recipe = recipe;
    await settle(root, '.card');

    expect(root.querySelector('rf-tag[slot="footer"]')).not.toBeNull();
  });

  it('does not select the card when slotted footer content is clicked', async () => {
    const { root, spyOnEvent } = await render(
    	'<rf-recipe-card><button slot="footer" id="plan">Add to plan</button></rf-recipe-card>',
    	{},
    );
    (root as any).recipe = recipe;
    await settle(root, '.card');

    const selected = spyOnEvent('rfSelect');
    root.querySelector<HTMLElement>('#plan').click();

    expect(selected.length).toBe(0);
  });
});
