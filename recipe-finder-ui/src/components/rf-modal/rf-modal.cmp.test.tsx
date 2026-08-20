import { describe, expect, it, render } from '@stencil/vitest';

describe('rf-modal', () => {
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
});
