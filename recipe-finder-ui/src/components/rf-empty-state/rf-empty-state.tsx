import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'rf-empty-state',
  styleUrl: 'rf-empty-state.css',
  shadow: true,
})
export class RfEmptyState {
  @Prop() icon = '🍲';
  @Prop() heading = 'Nothing here yet';
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
