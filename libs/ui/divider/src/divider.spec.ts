import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuiDivider, GuiDividerInset } from './divider';

@Component({
  imports: [GuiDivider],
  template: `<gui-divider
    [inset]="inset()"
    [orientation]="orientation()"
  ></gui-divider>`,
})
class DividerHost {
  readonly inset = signal<GuiDividerInset>('none');
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('GuiDivider', () => {
  function render(): HTMLElement {
    const fixture = TestBed.createComponent(DividerHost);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('gui-divider');
  }

  it('exposes role=separator and is not focusable (Req 14.5)', () => {
    const el = render();
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.hasAttribute('tabindex')).toBe(false);
  });

  it('reflects orientation onto aria-orientation (Req 3.3)', () => {
    const fixture = TestBed.createComponent(DividerHost);
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('gui-divider');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('reflects inset onto data-inset (Req 3.2)', () => {
    const fixture = TestBed.createComponent(DividerHost);
    fixture.componentInstance.inset.set('middle-inset');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('gui-divider');
    expect(el.getAttribute('data-inset')).toBe('middle-inset');
  });
});
