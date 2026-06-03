import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiList } from './list';
import { GuiListItem } from './list-item';
import { GuiListMode } from './list-context';

@Component({
  imports: [GuiList, GuiListItem],
  template: `
    <gui-list [mode]="mode()">
      <gui-list-item [lines]="lines()" [disabled]="disabled()">
        Headline
        <span guiListItemSupporting>Supporting</span>
      </gui-list-item>
    </gui-list>
  `,
})
class ItemHost {
  readonly mode = signal<GuiListMode>('action');
  readonly lines = signal<1 | 2 | 3>(1);
  readonly disabled = signal(false);
}

describe('GuiListItem', () => {
  it('reflects line count onto data-lines (Req 4.2)', () => {
    const fixture = TestBed.createComponent(ItemHost);
    fixture.componentInstance.lines.set(3);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('gui-list-item');
    expect(item.getAttribute('data-lines')).toBe('3');
  });

  it('action mode exposes role=listitem (Req 5)', () => {
    const fixture = TestBed.createComponent(ItemHost);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('gui-list-item');
    expect(item.getAttribute('role')).toBe('listitem');
  });

  it('listbox mode exposes role=option + aria-selected (Req 6.1)', () => {
    const fixture = TestBed.createComponent(ItemHost);
    fixture.componentInstance.mode.set('listbox');
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('gui-list-item');
    expect(item.getAttribute('role')).toBe('option');
    expect(item.getAttribute('aria-selected')).toBe('false');
  });

  it('disabled item exposes aria-disabled (Req 6.6)', () => {
    const fixture = TestBed.createComponent(ItemHost);
    fixture.componentInstance.mode.set('listbox');
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('gui-list-item');
    expect(item.getAttribute('aria-disabled')).toBe('true');
  });

  it('carries the focus-ring directive for a keyboard focus indicator (Req 14.4)', () => {
    const fixture = TestBed.createComponent(ItemHost);
    fixture.componentInstance.mode.set('listbox');
    fixture.detectChanges();
    const item = fixture.nativeElement.querySelector('gui-list-item');
    // GuiFocusRingDirective applies `.gui-focus-ring`; it toggles
    // `.gui-focus-visible` (and thus the outline) on keyboard focus.
    expect(item.classList.contains('gui-focus-ring')).toBe(true);
  });
});
