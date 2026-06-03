import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiList } from './list';
import { GuiListItem } from './list-item';

@Component({
  imports: [GuiList, GuiListItem],
  template: `
    <gui-list mode="listbox" [multiselectable]="multi()">
      <gui-list-item selectable>Apple</gui-list-item>
      <gui-list-item selectable>Banana</gui-list-item>
      <gui-list-item selectable>Cherry</gui-list-item>
    </gui-list>
  `,
})
class ListboxHost {
  readonly multi = signal(false);
}

@Component({
  imports: [GuiList, GuiListItem],
  template: `
    <gui-list mode="action">
      <gui-list-item><button>One</button></gui-list-item>
      <gui-list-item><button>Two</button></gui-list-item>
    </gui-list>
  `,
})
class ActionHost {}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

const ENTER = 13;
const ARROW_DOWN = 40;

/**
 * Build a keydown event. CDK's `ListKeyManager` keys off the (deprecated)
 * `keyCode`, which jsdom's constructor always leaves at 0 — real browsers
 * populate it — so the tests set it explicitly.
 */
function keydown(key: string, keyCode: number): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true });
  Object.defineProperty(event, 'keyCode', { get: () => keyCode });
  return event;
}

describe('GuiList (listbox)', () => {
  function setup(multi = false) {
    const fixture = TestBed.createComponent(ListboxHost);
    fixture.componentInstance.multi.set(multi);
    fixture.detectChanges();
    flush();
    const list = fixture.nativeElement.querySelector('gui-list') as HTMLElement;
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('gui-list-item'),
    ) as HTMLElement[];
    return { fixture, list, items };
  }

  it('seeds a single roving tab stop on the first option (Req 6.2)', () => {
    const { items } = setup();
    expect(items[0].getAttribute('tabindex')).toBe('0');
    expect(items[1].getAttribute('tabindex')).toBe('-1');
    expect(items[2].getAttribute('tabindex')).toBe('-1');
  });

  it('moves the tab stop with ArrowDown (Req 6.2)', () => {
    const { fixture, list, items } = setup();
    list.dispatchEvent(keydown('ArrowDown', ARROW_DOWN));
    fixture.detectChanges();
    expect(items[0].getAttribute('tabindex')).toBe('-1');
    expect(items[1].getAttribute('tabindex')).toBe('0');
  });

  it('toggles aria-selected on Enter; single-select clears the previous (Req 6.3)', () => {
    const { fixture, list, items } = setup();
    // Select the first (active) option.
    list.dispatchEvent(keydown('Enter', ENTER));
    fixture.detectChanges();
    expect(items[0].getAttribute('aria-selected')).toBe('true');

    // Move down and select the second; first clears (single select).
    list.dispatchEvent(keydown('ArrowDown', ARROW_DOWN));
    list.dispatchEvent(keydown('Enter', ENTER));
    fixture.detectChanges();
    expect(items[1].getAttribute('aria-selected')).toBe('true');
    expect(items[0].getAttribute('aria-selected')).toBe('false');
  });

  it('allows multiple selections when multiselectable (Req 6.3)', () => {
    const { fixture, list, items } = setup(true);
    list.dispatchEvent(keydown('Enter', ENTER));
    list.dispatchEvent(keydown('ArrowDown', ARROW_DOWN));
    list.dispatchEvent(keydown('Enter', ENTER));
    fixture.detectChanges();
    expect(items[0].getAttribute('aria-selected')).toBe('true');
    expect(items[1].getAttribute('aria-selected')).toBe('true');
  });

  it('toggles selection on click (Req 6.3)', () => {
    const { fixture, items } = setup();
    items[2].dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(items[2].getAttribute('aria-selected')).toBe('true');
  });
});

describe('GuiList (action)', () => {
  it('is a plain list with no roving tab stops (Req 5)', () => {
    const fixture = TestBed.createComponent(ActionHost);
    fixture.detectChanges();
    flush();
    const list = fixture.nativeElement.querySelector('gui-list') as HTMLElement;
    const items = Array.from(
      fixture.nativeElement.querySelectorAll('gui-list-item'),
    ) as HTMLElement[];
    expect(list.getAttribute('role')).toBe('list');
    expect(items[0].getAttribute('role')).toBe('listitem');
    expect(items[0].hasAttribute('tabindex')).toBe(false);
  });
});
