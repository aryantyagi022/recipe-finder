import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { RecipeCardData } from '../../types';
import { formatMeta } from '../../utils/format';

/**
 * A recipe summary card with an image, metadata, tags and a favourite toggle.
 *
 * @slot footer - Action buttons rendered at the bottom of the card. Clicks and key presses on
 * slotted content never trigger `rfSelect`.
 */
@Component({
  tag: 'rf-recipe-card',
  styleUrl: 'rf-recipe-card.css',
  shadow: true,
})
export class RfRecipeCard {
  /** The recipe to render. Must be set as a DOM property, not an attribute. Nothing renders until it is set. */
  @Prop() recipe: RecipeCardData;
  /** Whether the recipe is currently favourited, which drives the heart button's state. */
  @Prop() favorite = false;
  /** Optional label overlaid on the image, for example "My recipe". */
  @Prop() badge = '';
  /** Renders a denser card for sidebars and pickers. */
  @Prop() compact = false;

  /** Emitted with the recipe when the card or its title is activated. */
  @Event({ eventName: 'rfSelect' }) rfSelect: EventEmitter<RecipeCardData>;
  /** Emitted with the recipe and the requested state when the favourite button is activated. */
  @Event({ eventName: 'rfFavoriteToggle' }) rfFavoriteToggle: EventEmitter<{ recipe: RecipeCardData; favorite: boolean }>;

  private handleSelect = (event?: Event) => {
    const target = event?.target as HTMLElement | null;
    if (target?.closest?.('[slot]') || target?.closest?.('button')) {
      return;
    }
    this.emitSelect();
  };

  private emitSelect = () => {
    if (this.recipe) {
      this.rfSelect.emit(this.recipe);
    }
  };

  private handleFavorite = () => {
    this.rfFavoriteToggle.emit({ recipe: this.recipe, favorite: !this.favorite });
  };

  render() {
    if (!this.recipe) {
      return null;
    }

    const { title, image, category, area, tags = [] } = this.recipe;

    return (
      <article class={{ card: true, compact: this.compact }} onClick={this.handleSelect}>
        <div class="media">
          {image ? <img src={image} alt={title} loading="lazy" /> : <div class="placeholder">🍽</div>}
          {this.badge && <span class="badge">{this.badge}</span>}
          <button
            type="button"
            class={{ fav: true, active: this.favorite }}
            aria-pressed={String(this.favorite)}
            aria-label={this.favorite ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
            onClick={this.handleFavorite}
          >
            {this.favorite ? '♥' : '♡'}
          </button>
        </div>
        <div class="body">
          <h3>
            <button type="button" class="title" onClick={this.emitSelect}>
              {title}
            </button>
          </h3>
          <p class="meta">{formatMeta(category, area) || 'Uncategorised'}</p>
          {tags.length > 0 && (
            <ul class="tags">
              {tags.slice(0, 3).map(tag => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          <div class="footer">
            <slot name="footer" />
          </div>
        </div>
      </article>
    );
  }
}
