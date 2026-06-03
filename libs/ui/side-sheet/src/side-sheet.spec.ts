import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  GuiSideSheetActions,
  GuiSideSheetContent,
  GuiSideSheetHeader,
  GuiSideSheetSurface,
} from './side-sheet';

@Component({
  imports: [
    GuiSideSheetSurface,
    GuiSideSheetHeader,
    GuiSideSheetContent,
    GuiSideSheetActions,
  ],
  template: `
    <gui-side-sheet [(open)]="open">
      <gui-side-sheet-header>
        Filters
        <button guiSideSheetClose type="button" class="close-btn">×</button>
      </gui-side-sheet-header>
      <gui-side-sheet-content><p class="sheet-body">Body</p></gui-side-sheet-content>
      <gui-side-sheet-actions>
        <button type="button">Apply</button>
      </gui-side-sheet-actions>
    </gui-side-sheet>
  `,
})
class StandardHost {
  readonly open = signal(true);
}

describe('GuiSideSheetSurface (standard)', () => {
  it('renders inline with no scrim, leaving the page interactive (Req 10.3)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
    const host = fixture.nativeElement.querySelector('gui-side-sheet');
    expect(host.hasAttribute('data-open')).toBe(true);
    expect(host.querySelector('.sheet-body')?.textContent).toContain('Body');
  });

  it('renders the header (title + close) and actions slots (Req 10.4)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('gui-side-sheet');
    expect(host.querySelector('gui-side-sheet-header')).not.toBeNull();
    expect(host.querySelector('.close-btn')).not.toBeNull();
    expect(host.querySelector('gui-side-sheet-actions')).not.toBeNull();
  });

  it('provides a scrollable content region between header and actions (Req 10.6)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('gui-side-sheet');
    const content = host.querySelector('gui-side-sheet-content');
    expect(content).not.toBeNull();
    expect(content.querySelector('.sheet-body')?.textContent).toContain('Body');
  });

  it('reflects the open model onto data-open + aria-hidden (Req 10.3)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('gui-side-sheet');
    expect(host.hasAttribute('data-open')).toBe(false);
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });
});
