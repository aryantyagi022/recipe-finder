import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'rf-rating',
  styleUrl: 'rf-rating.css',
  shadow: true,
})
export class RfRating {
  @Prop() value = 0;
  @Prop() max = 5;
  @Prop() readonly = false;
  @Prop() label = 'Rating';

  @State() hovered = 0;

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
