import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'rf-search-bar',
  styleUrl: 'rf-search-bar.css',
  shadow: true,
})
export class RfSearchBar {
  @Element() host: HTMLElement;

  @Prop() value = '';
  @Prop() placeholder = 'Search recipes';
  @Prop() label = '';
  @Prop() debounce = 350;
  @Prop() disabled = false;

  @State() draft = '';

  @Event({ eventName: 'rfSearch' }) rfSearch: EventEmitter<string>;
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
