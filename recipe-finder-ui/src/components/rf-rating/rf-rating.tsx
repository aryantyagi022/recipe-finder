import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';

/** A star rating control that can be interactive or read-only. */
@Component({
  tag: 'rf-rating',
  styleUrl: 'rf-rating.css',
  shadow: true,
})
export class RfRating {
  /** The current score, from 0 to `max`. */
  @Prop() value = 0;
  /** How many stars to render. */
  @Prop() max = 5;
  /** Renders the rating as a non-interactive display. */
  @Prop() readonly = false;
  /** Accessible name for the rating group. */
  @Prop() label = 'Rating';

  @State() hovered = 0;

  /** Emitted with the chosen score. Selecting the current score again emits `0` to clear it. */
  @Event({ eventName: 'rfRate' }) rfRate: EventEmitter<number>;

  private get stars(): number[] {
    return Array.from({ length: Math.max(1, this.max) }, (_, index) => index + 1);
  }

  private select(score: number) {
    if (this.readonly) {
      return;
    }
    this.rfRate.emit(score === this.value ? 0 : score);
  }

  render() {
    const active = this.hovered || this.value;

    return (
      <div class={{ rating: true, readonly: this.readonly }} role="group" aria-label={`${this.label}: ${this.value} of ${this.max}`}>
        {this.stars.map(score => (
          <button
            key={score}
            type="button"
            class={{ star: true, filled: score <= active }}
            disabled={this.readonly}
            aria-label={`Rate ${score} of ${this.max}`}
            onMouseEnter={() => !this.readonly && (this.hovered = score)}
            onMouseLeave={() => (this.hovered = 0)}
            onClick={() => this.select(score)}
          >
            ★
          </button>
        ))}
      </div>
    );
  }
}
