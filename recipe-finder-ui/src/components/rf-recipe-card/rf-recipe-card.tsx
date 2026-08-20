import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { RecipeCardData } from '../../types';
import { formatMeta } from '../../utils/format';

@Component({
  tag: 'rf-recipe-card',
  styleUrl: 'rf-recipe-card.css',
  shadow: true,
})
export class RfRecipeCard {
  @Prop() recipe: RecipeCardData;
  @Prop() favorite = false;
  @Prop() badge = '';
  @Prop() compact = false;

  @Event({ eventName: 'rfSelect' }) rfSelect: EventEmitter<RecipeCardData>;
  @Event({ eventName: 'rfFavoriteToggle' }) rfFavoriteToggle: EventEmitter<{ recipe: RecipeCardData; favorite: boolean }>;

  private handleSelect = (event?: Event) => {
    const target = event?.target as HTMLElement | null;
    if (target?.closest?.('[slot]')) {
      return;
    }
    if (this.recipe) {
      this.rfSelect.emit(this.recipe);
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleSelect(event);
    }
  };

  private handleFavorite = (event: MouseEvent) => {
    event.stopPropagation();
    this.rfFavoriteToggle.emit({ recipe: this.recipe, favorite: !this.favorite });
  };

  render() {
    if (!this.recipe) {
      return null;
    }

    const { title, image, category, area, tags = [] } = this.recipe;

    return (
      <article
        class={{ card: true, compact: this.compact }}
        tabindex="0"
        role="button"
        aria-label={`View ${title}`}
        onClick={this.handleSelect}
        onKeyDown={this.handleKeyDown}
      >
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
          <h3>{title}</h3>
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
