import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { GuiStateLayerDirective } from './state-layer.directive';

@Component({
  // A plain <div> host isolates the directive's own `disabled` input from the
  // native button `disabled` property/attribute semantics. Signal-backed state
  // keeps runtime updates clean under zoneless change detection.
  template: `<div
    guiStateLayer
    [disabled]="disabled()"
    [attr.aria-disabled]="ariaDisabled()"
  ></div>`,
  imports: [GuiStateLayerDirective],
})
class HostComponent {
  readonly disabled = signal(false);
  readonly ariaDisabled = signal<string | null>(null);
}

describe('GuiStateLayerDirective', () => {
  function setup(initial?: { disabled?: boolean; ariaDisabled?: string | null }) {
    const fixture = TestBed.createComponent(HostComponent);
    if (initial?.disabled !== undefined) {
      fixture.componentInstance.disabled.set(initial.disabled);
    }
    if (initial?.ariaDisabled !== undefined) {
      fixture.componentInstance.ariaDisabled.set(initial.ariaDisabled);
    }
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    return { fixture, host: fixture.componentInstance, el };
  }

  it('sets data-gui-state=pressed on pointerdown and clears on pointerup (Req 1.4)', () => {
    const { fixture, el } = setup();

    el.dispatchEvent(new Event('pointerdown'));
    fixture.detectChanges();
    expect(el.getAttribute('data-gui-state')).toBe('pressed');

    el.dispatchEvent(new Event('pointerup'));
    fixture.detectChanges();
    expect(el.getAttribute('data-gui-state')).toBeNull();
  });

  it('recognizes aria-disabled and suppresses the pressed state (Req 4.1, 4.4)', () => {
    const { fixture, el } = setup({ ariaDisabled: 'true' });

    expect(el.hasAttribute('data-gui-disabled')).toBe(true);

    el.dispatchEvent(new Event('pointerdown'));
    fixture.detectChanges();
    expect(el.getAttribute('data-gui-state')).toBeNull();
  });

  it('toggles disabled at runtime on the same element (Req 4.5)', () => {
    const { fixture, host, el } = setup();

    el.dispatchEvent(new Event('pointerdown'));
    fixture.detectChanges();
    expect(el.getAttribute('data-gui-state')).toBe('pressed');

    host.disabled.set(true);
    fixture.detectChanges();
    expect(el.hasAttribute('data-gui-disabled')).toBe(true);
    expect(el.getAttribute('data-gui-state')).toBeNull();

    host.disabled.set(false);
    fixture.detectChanges();
    expect(el.hasAttribute('data-gui-disabled')).toBe(false);
  });

  it('marks gui-focus-visible only for keyboard focus, via FocusMonitor (Req 1.3)', () => {
    // Same keyboard-focus signal as the ring, so the focus tint never desyncs
    // from the focus ring under programmatic / roving focus.
    const origin$ = new Subject<FocusOrigin>();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FocusMonitor,
          useValue: {
            monitor: () => origin$.asObservable(),
            stopMonitoring: () => undefined,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;

    origin$.next('mouse');
    expect(el.classList.contains('gui-focus-visible')).toBe(false);

    origin$.next('keyboard');
    expect(el.classList.contains('gui-focus-visible')).toBe(true);

    origin$.next(null);
    expect(el.classList.contains('gui-focus-visible')).toBe(false);
  });
});
