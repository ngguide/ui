import { Injectable, Signal, inject, signal } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

/**
 * Exposes whether the viewport is in M3's **compact** window class
 * (`< 600dp`) as a reactive signal, so components that must branch on window
 * size — full-screen-dialog auto-selection (Req 8) and carousel full-screen
 * orientation (Req 11.6) — share one source of truth (Req 16.3).
 *
 * Built on CDK's {@link MediaMatcher}, which is SSR-safe: on the server it
 * returns a no-op `MediaQueryList` whose `.matches` is `false`, so the initial
 * (non-compact) layout renders without touching `window.matchMedia`. The
 * `change` listener keeps the signal live when the viewport crosses the
 * breakpoint at runtime. Mirrors `GuiReducedMotion`.
 */
@Injectable({ providedIn: 'root' })
export class GuiBreakpoint {
  private readonly mql = inject(MediaMatcher).matchMedia(
    '(max-width: 599.98px)',
  );
  private readonly compact = signal(this.mql.matches);

  /** `true` when the viewport is in the compact window class (`< 600dp`). */
  readonly isCompact: Signal<boolean> = this.compact.asReadonly();

  constructor() {
    this.mql.addEventListener?.('change', (event) =>
      this.compact.set(event.matches),
    );
  }
}
