import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiBottomSheet } from './bottom-sheet.service';

@Component({ template: `<button type="button">action</button>` })
class SheetContent {}

function flush(): void {
  TestBed.inject(ApplicationRef).tick();
}

describe('GuiBottomSheet (modal)', () => {
  it('opens a bottom-anchored modal with scrim, role and handle (Req 9.1, 12.1)', () => {
    const ref = TestBed.inject(GuiBottomSheet).open(SheetContent, {
      ariaLabel: 'Sheet',
    });
    flush();
    const container = document.querySelector('.gui-bottom-sheet-container');
    expect(container?.getAttribute('role')).toBe('dialog');
    expect(container?.getAttribute('aria-modal')).toBe('true');
    expect(document.querySelector('.cdk-overlay-backdrop.gui-scrim')).not.toBeNull();
    const handle = document.querySelector(
      '.gui-bottom-sheet-handle',
    ) as HTMLButtonElement | null;
    expect(handle).not.toBeNull();
    // M3: the drag handle is a focusable, labelled button (role "button").
    expect(handle?.tagName).toBe('BUTTON');
    expect(handle?.getAttribute('aria-label')).toBe('Resize bottom sheet');
    ref.close();
    flush();
  });

  it('hides the drag handle when showDragHandle is false (Req 9.1)', () => {
    const ref = TestBed.inject(GuiBottomSheet).open(SheetContent, {
      ariaLabel: 'Sheet',
      showDragHandle: false,
    });
    flush();
    expect(document.querySelector('.gui-bottom-sheet-handle')).toBeNull();
    ref.close();
    flush();
  });

  it('close(result) emits on closed (Req 16.2)', () => {
    const ref = TestBed.inject(GuiBottomSheet).open<string>(SheetContent);
    let result: string | undefined;
    ref.closed.subscribe((r) => (result = r));
    flush();
    ref.close('done');
    flush();
    expect(result).toBe('done');
    expect(document.querySelector('.gui-bottom-sheet-container')).toBeNull();
  });

  it('throws when opened without content', () => {
    expect(() =>
      TestBed.inject(GuiBottomSheet).open(null as never),
    ).toThrowError(/component type or a TemplateRef/);
  });
});
