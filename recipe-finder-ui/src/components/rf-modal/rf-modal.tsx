import { Component, Element, Event, EventEmitter, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'rf-modal',
  styleUrl: 'rf-modal.css',
  shadow: true,
})
export class RfModal {
  @Element() host: HTMLElement;

  @Prop() open = false;
  @Prop() heading = '';
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  @Prop() dismissible = true;

  @Event({ eventName: 'rfClose' }) rfClose: EventEmitter<void>;

  @Watch('open')
  toggleScrollLock(isOpen: boolean) {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  disconnectedCallback() {
    document.body.style.overflow = '';
  }

  private close = () => {
    if (this.dismissible) {
      this.rfClose.emit();
    }
  };

  private handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      this.close();
    }
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.close();
    }
  };

  render() {
    if (!this.open) {
      return null;
    }

    return (
      <div class="backdrop" onClick={this.handleBackdropClick} onKeyDown={this.handleKeyDown} tabindex={-1}>
        <div class={`dialog ${this.size}`} role="dialog" aria-modal="true" aria-label={this.heading}>
          <header>
            <slot name="header">
              <h2>{this.heading}</h2>
            </slot>
            {this.dismissible && (
              <button type="button" class="close" aria-label="Close dialog" onClick={this.close}>
                ×
              </button>
            )}
          </header>
          <div class="content">
            <slot />
          </div>
          <footer>
            <slot name="footer" />
          </footer>
        </div>
      </div>
    );
  }
}
