import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { GuiFocusRingDirective } from './focus-ring.directive';

@Component({
  template: `<div guiFocusRing></div>`,
  imports: [GuiFocusRingDirective],
})
class HostComponent {}

/** Drives FocusOrigin emissions and records monitor/stopMonitoring calls. */
class FakeFocusMonitor {
  readonly origin$ = new Subject<FocusOrigin>();
  readonly monitor = vi.fn(() => this.origin$.asObservable());
  readonly stopMonitoring = vi.fn();
}

describe('GuiFocusRingDirective', () => {
  function setup() {
    const fm = new FakeFocusMonitor();
    TestBed.configureTestingModule({
      providers: [{ provide: FocusMonitor, useValue: fm }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('div') as HTMLElement;
    return { fixture, fm, el };
  }

  it('adds gui-focus-visible only for keyboard focus origin (Req 3.1, 3.2)', () => {
    const { fm, el } = setup();

    fm.origin$.next('mouse');
    expect(el.classList.contains('gui-focus-visible')).toBe(false);

    fm.origin$.next('keyboard');
    expect(el.classList.contains('gui-focus-visible')).toBe(true);
  });

  it('removes the ring when focus is lost (Req 3.3)', () => {
    const { fm, el } = setup();

    fm.origin$.next('keyboard');
    expect(el.classList.contains('gui-focus-visible')).toBe(true);

    // FocusMonitor emits null on blur.
    fm.origin$.next(null);
    expect(el.classList.contains('gui-focus-visible')).toBe(false);
  });

  it('stops monitoring the host on destroy (cleanup)', () => {
    const { fixture, fm, el } = setup();

    fixture.destroy();
    expect(fm.stopMonitoring).toHaveBeenCalledWith(el);
  });

  // Edge Case 1 (design): keyboard-driven *programmatic* focus (e.g. roving
  // tabindex) must still show the ring. FocusMonitor maps it to 'keyboard' via
  // its InputModalityDetector, which depends on real keyboard events — not
  // reproducible in jsdom. This is verified in the browser (Group F /
  // spec:test). If the browser check shows 'program' for keyboard-driven
  // focus(), widen the directive condition to also accept that case.
});
