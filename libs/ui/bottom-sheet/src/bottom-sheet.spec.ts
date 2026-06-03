import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { GuiBottomSheetSurface } from './bottom-sheet';

@Component({
  imports: [GuiBottomSheetSurface],
  template: `
    <gui-bottom-sheet [(open)]="open">
      <p class="sheet-body">Standard sheet</p>
    </gui-bottom-sheet>
  `,
})
class StandardHost {
  readonly open = signal(true);
}

/** Build a minimal CdkDragEnd with the given downward distance. */
function dragEnd(distanceY: number): CdkDragEnd {
  const reset = (): void => undefined;
  return {
    distance: { x: 0, y: distanceY },
    source: { setFreeDragPosition: reset },
  } as unknown as CdkDragEnd;
}

describe('GuiBottomSheetSurface (standard)', () => {
  it('renders inline with no scrim, leaving the page interactive (Req 9.2)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
    const host = fixture.nativeElement.querySelector('gui-bottom-sheet');
    expect(host.hasAttribute('data-open')).toBe(true);
    expect(host.querySelector('.sheet-body')?.textContent).toContain(
      'Standard sheet',
    );
  });

  it('reflects the open model onto data-open + aria-hidden (Req 9.2)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('gui-bottom-sheet');
    expect(host.hasAttribute('data-open')).toBe(false);
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('dismisses when dragged past the threshold (Req 9.4)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.detectChanges();
    const surface = fixture.debugElement.children[0]
      .componentInstance as GuiBottomSheetSurface;
    (surface as unknown as { onDragEnded(e: CdkDragEnd): void }).onDragEnded(
      dragEnd(120),
    );
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('springs back when dragged below the threshold (Req 9.4)', () => {
    const fixture = TestBed.createComponent(StandardHost);
    fixture.detectChanges();
    const surface = fixture.debugElement.children[0]
      .componentInstance as GuiBottomSheetSurface;
    (surface as unknown as { onDragEnded(e: CdkDragEnd): void }).onDragEnded(
      dragEnd(20),
    );
    expect(fixture.componentInstance.open()).toBe(true);
  });
});
