import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiSideSheet } from './side-sheet.service';

@Component({ template: `<button type="button">action</button>` })
class SheetContent {}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

const ESCAPE = 27;

function escape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
  Object.defineProperty(event, 'keyCode', { get: () => ESCAPE });
  return event;
}

describe('GuiSideSheet (modal)', () => {
  it('opens an end-anchored modal with scrim + role (Req 10.1, 12.1)', () => {
    const ref = TestBed.inject(GuiSideSheet).open(SheetContent, {
      ariaLabel: 'Sheet',
    });
    flush();
    const container = document.querySelector('.gui-side-sheet-container');
    expect(container?.getAttribute('role')).toBe('dialog');
    expect(container?.getAttribute('aria-modal')).toBe('true');
    expect(
      document.querySelector('.cdk-overlay-backdrop.gui-scrim'),
    ).not.toBeNull();
    ref.close();
    flush();
  });

  it('closes on Escape and emits the result (Req 10.6, 16.2)', () => {
    const ref = TestBed.inject(GuiSideSheet).open<string>(SheetContent, {
      ariaLabel: 'Sheet',
    });
    let result: string | undefined;
    ref.closed.subscribe((r) => (result = r));
    flush();
    document.querySelector('.gui-side-sheet-container')?.dispatchEvent(escape());
    flush();
    expect(document.querySelector('.gui-side-sheet-container')).toBeNull();
    // Escape closes with undefined result.
    expect(result).toBeUndefined();
  });

  it('throws when opened without content', () => {
    expect(() =>
      TestBed.inject(GuiSideSheet).open(null as never),
    ).toThrowError(/component type or a TemplateRef/);
  });
});
