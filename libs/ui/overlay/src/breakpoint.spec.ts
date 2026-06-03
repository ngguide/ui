import { TestBed } from '@angular/core/testing';
import { MediaMatcher } from '@angular/cdk/layout';
import { GuiBreakpoint } from './breakpoint';

/** Controllable MediaQueryList stand-in. */
class FakeMediaQueryList {
  matches = false;
  private handlers: Array<(e: { matches: boolean }) => void> = [];

  addEventListener(
    _type: string,
    handler: (e: { matches: boolean }) => void,
  ): void {
    this.handlers.push(handler);
  }

  /** Simulate the viewport crossing the breakpoint at runtime. */
  emit(matches: boolean): void {
    this.matches = matches;
    for (const handler of this.handlers) {
      handler({ matches });
    }
  }
}

describe('GuiBreakpoint', () => {
  let mql: FakeMediaQueryList;

  function configure(initialMatches: boolean): GuiBreakpoint {
    mql = new FakeMediaQueryList();
    mql.matches = initialMatches;
    TestBed.configureTestingModule({
      providers: [
        { provide: MediaMatcher, useValue: { matchMedia: () => mql } },
      ],
    });
    return TestBed.inject(GuiBreakpoint);
  }

  it('reflects the initial MediaQueryList.matches value', () => {
    expect(configure(true).isCompact()).toBe(true);
    TestBed.resetTestingModule();
    expect(configure(false).isCompact()).toBe(false);
  });

  it('updates the signal when the viewport crosses the breakpoint', () => {
    const svc = configure(false);
    expect(svc.isCompact()).toBe(false);

    mql.emit(true);
    expect(svc.isCompact()).toBe(true);

    mql.emit(false);
    expect(svc.isCompact()).toBe(false);
  });
});
