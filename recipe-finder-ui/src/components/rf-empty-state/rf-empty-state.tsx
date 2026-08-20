import { Component, Prop, h } from '@stencil/core';

/**
 * A placeholder shown when a list or search has no results.
 *
 * @slot - Call-to-action content rendered below the message.
 */
@Component({
  tag: 'rf-empty-state',
  styleUrl: 'rf-empty-state.css',
  shadow: true,
})
export class RfEmptyState {
  /** Decorative emoji or glyph shown above the heading. */
  @Prop() icon = '🍲';
  /** The primary message. */
  @Prop() heading = 'Nothing here yet';
  /** Optional supporting text shown below the heading. */
  @Prop() message = '';

  render() {
    return (
      <div class="empty">
        <span class="icon" aria-hidden="true">
          {this.icon}
        </span>
        <h3>{this.heading}</h3>
        {this.message && <p>{this.message}</p>}
        <div class="actions">
          <slot />
        </div>
      </div>
    );
  }
}
