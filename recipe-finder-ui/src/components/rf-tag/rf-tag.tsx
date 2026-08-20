import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { TagTone } from '../../types';

@Component({
  tag: 'rf-tag',
  styleUrl: 'rf-tag.css',
  shadow: true,
})
export class RfTag {
  @Prop() label = '';
  @Prop() tone: TagTone = 'neutral';
  @Prop() removable = false;

  @Event({ eventName: 'rfRemove' }) rfRemove: EventEmitter<string>;

  render() {
    return (
      <span class={`tag ${this.tone}`}>
        <slot>{this.label}</slot>
        {this.removable && (
          <button type="button" aria-label={`Remove ${this.label}`} onClick={() => this.rfRemove.emit(this.label)}>
            ×
          </button>
        )}
      </span>
    );
  }
}
