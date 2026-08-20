import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

/**
 * A debounced search field with an optional clear button and a slot for adjacent actions.
 *
 * @slot actions - Buttons rendered inside the field, after the clear button.
 */
@Component({
  tag: 'rf-search-bar',
  styleUrl: 'rf-search-bar.css',
  shadow: true,
})
export class RfSearchBar {
  @Element() host: HTMLElement;

  /** The current search term. Updating it from outside replaces whatever the user has typed. */
  @Prop() value = '';
  /** Placeholder shown while the field is empty. */
  @Prop() placeholder = 'Search recipes';
  /** Visible label for the field. When empty, no label element is rendered. */
  @Prop() label = '';
  /** Milliseconds to wait after the last keystroke before emitting `rfSearch`. */
  @Prop() debounce = 350;
  /** Disables the input, for example while results are loading. */
  @Prop() disabled = false;

  @State() draft = '';

  /** Emitted with the trimmed search term after the debounce elapses, or immediately on submit. */
  @Event({ eventName: 'rfSearch' }) rfSearch: EventEmitter<string>;
  /** Emitted when the clear button is pressed, just before an empty `rfSearch`. */
  @Event({ eventName: 'rfClear' }) rfClear: EventEmitter<void>;

  private timer: ReturnType<typeof setTimeout>;

  componentWillLoad() {
    this.draft = this.value ?? '';
  }

  @Watch('value')
  syncValue(next: string) {
    if ((next ?? '') !== this.draft) {
      this.draft = next ?? '';
    }
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
  }

  private emit(term: string) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.rfSearch.emit(term.trim()), this.debounce);
  }

  private handleInput = (event: Event) => {
    this.draft = (event.target as HTMLInputElement).value;
    this.emit(this.draft);
  };

  private handleSubmit = (event: Event) => {
    event.preventDefault();
    clearTimeout(this.timer);
    this.rfSearch.emit(this.draft.trim());
  };

  private handleClear = () => {
    clearTimeout(this.timer);
    this.draft = '';
    this.rfClear.emit();
    this.rfSearch.emit('');
  };

  render() {
    return (
      <form class="bar" role="search" onSubmit={this.handleSubmit}>
        {this.label && <label htmlFor="rf-search-input">{this.label}</label>}
        <div class="field">
          <span class="icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="rf-search-input"
            type="search"
            autocomplete="off"
            disabled={this.disabled}
            value={this.draft}
            placeholder={this.placeholder}
            onInput={this.handleInput}
          />
          {this.draft && (
            <button type="button" class="clear" aria-label="Clear search" onClick={this.handleClear}>
              ×
            </button>
          )}
          <slot name="actions" />
        </div>
      </form>
    );
  }
}
