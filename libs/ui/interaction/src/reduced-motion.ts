import { Injectable, Signal, inject, signal } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';

/**
 * Exposes the user's `prefers-reduced-motion` preference as a reactive signal so
 * every component honors it consistently (Req 5.4). Built on CDK's
 * {@link MediaMatcher}, which is SSR-safe — on the server it returns a no-op
 * `MediaQueryList` whose `.matches` is `false`, so the foundation animates
 * normally after hydration. The `change` listener keeps the signal live when the
 * OS setting flips at runtime (Req 5.3).
 */
@Injectable({ providedIn: 'root' })
export class GuiReducedMotion {
  private readonly mql = inject(MediaMatcher).matchMedia(
    '(prefers-reduced-motion: reduce)',
  );
  private readonly reduce = signal(this.mql.matches);

  /** `true` when the user requests reduced motion (Req 5.2–5.4). */
  readonly prefersReducedMotion: Signal<boolean> = this.reduce.asReadonly();

  constructor() {
    this.mql.addEventListener?.('change', (event) =>
      this.reduce.set(event.matches),
    );
  }
}
