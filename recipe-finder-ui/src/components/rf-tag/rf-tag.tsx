import { Component, Element, Event, EventEmitter, Prop, h } from '@stencil/core';
import type { TagTone } from '../../types';

/**
 * A small pill for categories, cuisines and keywords, optionally removable.
 *
 * @slot - Tag content. Overrides `label` for display, but `label` is still used for the accessible name.
 */
@Component({
  tag: 'rf-tag',
  styleUrl: 'rf-tag.css',
  shadow: true,
})
export class RfTag {
  @Element() host: HTMLElement;

  /** Text shown when nothing is slotted, and the basis of the remove button's accessible name. */
  @Prop() label = '';
  /** Payload emitted by `rfRemove`. Defaults to the label or the slotted text. */
  @Prop() value = '';
  /** Colour variant. */
  @Prop() tone: TagTone = 'neutral';
  /** Whether to render a remove button. */
  @Prop() removable = false;

  /** Emitted with `value` when the remove button is pressed. */
  @Event({ eventName: 'rfRemove' }) rfRemove: EventEmitter<string>;

  private text() {
    return this.label || this.host.textContent?.trim() || '';
  }

  render() {
    const text = this.text();

    return (
      <span class={`tag ${this.tone}`}>
        <slot>{this.label}</slot>
        {this.removable && (
          <button type="button" aria-label={text ? `Remove ${text}` : 'Remove tag'} onClick={() => this.rfRemove.emit(this.value || text)}>
            ×
          </button>
        )}
      </span>
    );
  }
}
