import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let openModals = 0;
let previousOverflow = '';

function lockScroll() {
  if (openModals === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  openModals += 1;
}

function unlockScroll() {
  openModals = Math.max(0, openModals - 1);
  if (openModals === 0) {
    document.body.style.overflow = previousOverflow;
  }
}

/**
 * An accessible dialog that traps focus, closes on Escape and restores focus on close.
 *
 * @slot header - Replaces the default heading.
 * @slot - The dialog body.
 * @slot footer - Action buttons rendered at the bottom of the dialog.
 */
@Component({
  tag: 'rf-modal',
  styleUrl: 'rf-modal.css',
  shadow: true,
})
export class RfModal {
  @Element() host: HTMLElement;

  /** Whether the dialog is visible. Nothing is rendered while it is false. */
  @Prop() open = false;
  /** The dialog title, also used as its accessible name. */
  @Prop() heading = '';
  /** Dialog width preset. */
  @Prop() size: 'sm' | 'md' | 'lg' = 'md';
  /** Whether Escape, the backdrop and the close button can dismiss the dialog. */
  @Prop() dismissible = true;

  /** Emitted when the user asks to dismiss the dialog. The consumer must set `open` to false. */
  @Event({ eventName: 'rfClose' }) rfClose: EventEmitter<void>;

  @State() slottedHeading = '';

  private active = false;
  private lastFocused: HTMLElement | null = null;
  private pendingFocus = false;

  componentWillLoad() {
    this.syncOpenState(this.open);
  }

  componentDidRender() {
    const slottedHeading = this.host.querySelector('[slot="header"]')?.textContent?.trim() ?? '';
    if (slottedHeading !== this.slottedHeading) {
      this.slottedHeading = slottedHeading;
    }

    if (!this.pendingFocus) {
      return;
    }

    this.pendingFocus = false;
    const dialog = this.host.shadowRoot?.querySelector<HTMLElement>('.dialog');
    requestAnimationFrame(() => (this.tabbables()[0] ?? dialog)?.focus());
  }

  disconnectedCallback() {
    this.syncOpenState(false);
  }

  @Watch('open')
  syncOpenState(isOpen: boolean) {
    if (isOpen === this.active) {
      return;
    }

    if (isOpen) {
      this.lastFocused = document.activeElement as HTMLElement | null;
      lockScroll();
      document.addEventListener('keydown', this.handleDocumentKeyDown, true);
      this.pendingFocus = true;
    } else {
      unlockScroll();
      document.removeEventListener('keydown', this.handleDocumentKeyDown, true);
      this.pendingFocus = false;
      this.lastFocused?.focus?.();
      this.lastFocused = null;
    }

    this.active = isOpen;
  }

  private tabbables(): HTMLElement[] {
    const dialog = this.host.shadowRoot?.querySelector('.dialog');
    if (!dialog) {
      return [];
    }

    return [...Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)), ...Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE))];
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

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (!this.open) {
      return;
    }

    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const tabbables = this.tabbables();
    if (tabbables.length === 0) {
      event.preventDefault();
      return;
    }

    const active = (this.host.shadowRoot?.activeElement ?? document.activeElement) as HTMLElement | null;
    const index = tabbables.indexOf(active);
    const next = event.shiftKey ? index - 1 : index + 1;

    if (index === -1 || next < 0 || next >= tabbables.length) {
      event.preventDefault();
      tabbables[event.shiftKey ? tabbables.length - 1 : 0].focus();
    }
  };

  render() {
    if (!this.open) {
      return null;
    }

    return (
      <div class="backdrop" onClick={this.handleBackdropClick}>
        <div
          class={`dialog ${this.size}`}
          role="dialog"
          aria-modal="true"
          aria-label={this.heading || this.slottedHeading || 'Dialog'}
          tabindex={-1}
        >
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
