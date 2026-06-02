import { DOWN_ARROW } from '@angular/cdk/keycodes';
import { FocusableOption, createRovingFocus } from './a11y';

class FakeItem implements FocusableOption {
  focusCount = 0;
  constructor(readonly label: string) {}
  focus(): void {
    this.focusCount++;
  }
  getLabel(): string {
    return this.label;
  }
}

/** A keydown whose `keyCode` is what CDK's ListKeyManager.onKeydown reads. */
function arrowDown(): KeyboardEvent {
  const event = new KeyboardEvent('keydown');
  Object.defineProperty(event, 'keyCode', { get: () => DOWN_ARROW });
  return event;
}

describe('createRovingFocus', () => {
  it('moves the active item on arrow navigation, one tab stop at a time (Req 6.3)', () => {
    const items = [new FakeItem('a'), new FakeItem('b'), new FakeItem('c')];
    const manager = createRovingFocus(items, { orientation: 'vertical' });

    manager.setActiveItem(0);
    expect(manager.activeItemIndex).toBe(0);
    expect(manager.activeItem).toBe(items[0]);

    manager.onKeydown(arrowDown());
    expect(manager.activeItemIndex).toBe(1);
    expect(manager.activeItem).toBe(items[1]);
    // Exactly one item is the active tab stop at a time.
    expect(items[1].focusCount).toBeGreaterThan(0);

    manager.onKeydown(arrowDown());
    expect(manager.activeItemIndex).toBe(2);
  });

  it('wraps from last back to first by default (WAI-ARIA APG wrap-around)', () => {
    const items = [new FakeItem('a'), new FakeItem('b'), new FakeItem('c')];
    const manager = createRovingFocus(items, { orientation: 'vertical' });

    manager.setActiveItem(2);
    manager.onKeydown(arrowDown());
    expect(manager.activeItemIndex).toBe(0);
  });

  it('does not wrap when wrap is disabled', () => {
    const items = [new FakeItem('a'), new FakeItem('b')];
    const manager = createRovingFocus(items, { orientation: 'vertical', wrap: false });

    manager.setActiveItem(1);
    manager.onKeydown(arrowDown());
    expect(manager.activeItemIndex).toBe(1);
  });
});
