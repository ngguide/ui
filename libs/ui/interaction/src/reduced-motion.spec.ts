import { TestBed } from '@angular/core/testing';
import { MediaMatcher } from '@angular/cdk/layout';
import { GuiReducedMotion } from './reduced-motion';

/** Controllable MediaQueryList stand-in. */
class FakeMediaQueryList {
  matches = false;
  private handlers: Array<(e: { matches: boolean }) => void> = [];

  addEventListener(_type: string, handler: (e: { matches: boolean }) => void): void {
    this.handlers.push(handler);
  }

  /** Simulate the OS toggling the preference at runtime. */
  emit(matches: boolean): void {
    this.matches = matches;
    for (const handler of this.handlers) {
      handler({ matches });
    }
  }
}

describe('GuiReducedMotion', () => {
  let mql: FakeMediaQueryList;

  function configure(initialMatches: boolean): GuiReducedMotion {
    mql = new FakeMediaQueryList();
    mql.matches = initialMatches;
    TestBed.configureTestingModule({
      providers: [{ provide: MediaMatcher, useValue: { matchMedia: () => mql } }],
    });
    return TestBed.inject(GuiReducedMotion);
  }

  it('reflects the initial MediaQueryList.matches value', () => {
    expect(configure(true).prefersReducedMotion()).toBe(true);
  });

  it('updates the signal when a change event fires (Req 5.3)', () => {
    const svc = configure(false);
    expect(svc.prefersReducedMotion()).toBe(false);

    mql.emit(true);
    expect(svc.prefersReducedMotion()).toBe(true);

    mql.emit(false);
    expect(svc.prefersReducedMotion()).toBe(false);
  });
});
