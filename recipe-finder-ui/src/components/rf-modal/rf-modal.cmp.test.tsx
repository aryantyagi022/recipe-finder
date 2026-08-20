import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, render } from '@stencil/vitest';

const unmountAll = async () => {
  document.querySelectorAll('rf-modal').forEach(modal => modal.remove());
  await new Promise(resolve => setTimeout(resolve, 20));
};

describe('rf-modal', () => {
  afterEach(unmountAll);

  it('renders nothing while closed', async () => {
    const { root } = await render('<rf-modal heading="Plan meal"></rf-modal>', {});

    expect(root.shadowRoot.querySelector('.backdrop')).toBeNull();
  });

  it('emits rfClose when the backdrop is clicked', async () => {
    const { root, spyOnEvent } = await render('<rf-modal open heading="Plan meal"></rf-modal>', {});

    const closed = spyOnEvent('rfClose');
    root.shadowRoot.querySelector<HTMLElement>('.backdrop').click();

    expect(closed.length).toBe(1);
  });

  it('keeps slotted footer clicks bubbling without closing', async () => {
    const { root, spyOnEvent } = await render('<rf-modal open heading="Plan meal"><button slot="footer" id="save">Save</button></rf-modal>', {});

    const closed = spyOnEvent('rfClose');
    let bubbled = 0;
    root.addEventListener('click', () => (bubbled += 1));
    root.querySelector<HTMLElement>('#save').click();

    expect(bubbled).toBe(1);
    expect(closed.length).toBe(0);
  });

  it('closes on Escape from anywhere in the document', async () => {
    const { spyOnEvent } = await render('<rf-modal open heading="Plan meal"></rf-modal>', {});

    const closed = spyOnEvent('rfClose');
    await userEvent.keyboard('{Escape}');

    expect(closed.length).toBe(1);
  });

  it('moves focus into the dialog when it opens', async () => {
    const { root } = await render('<rf-modal open heading="Plan meal"><button slot="footer" id="save">Save</button></rf-modal>', {});
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(root.shadowRoot.activeElement?.className).toBe('close');
  });

  it('reference counts the scroll lock across stacked modals', async () => {
    const { root } = await render('<div><rf-modal open heading="A"></rf-modal><rf-modal heading="B"></rf-modal></div>', {});
    const [first, second] = Array.from(root.querySelectorAll('rf-modal'));
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(document.body.style.overflow).toBe('hidden');

    (second as any).open = true;
    await new Promise(resolve => setTimeout(resolve, 50));
    (second as any).open = false;
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(document.body.style.overflow).toBe('hidden');

    (first as any).open = false;
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(document.body.style.overflow).toBe('');
  });

  it('locks scrolling for a modal that is already open on first render', async () => {
    document.body.style.overflow = '';
    await render('<rf-modal open heading="Plan meal"></rf-modal>', {});
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(document.body.style.overflow).toBe('hidden');
  });
});
