import { Directive, ElementRef, OnDestroy, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';

/**
 * Shows the M3 focus indicator only for keyboard focus, using CDK
 * {@link FocusMonitor} (Decision 3B). FocusMonitor reports the {@link FocusOrigin}
 * and attributes keyboard-driven programmatic focus (e.g. roving tabindex) to
 * `'keyboard'` via its InputModalityDetector — closing the programmatic-focus
 * gap that bare `:focus-visible` leaves (Req 3.1, 3.2). It removes its tracking
 * on blur, so the ring clears automatically (Req 3.3).
 *
 * SSR-safe: on the server `monitor()` returns an empty observable, so no class
 * is toggled and there is no hydration mismatch (Req 7.3). The ring visual and
 * disabled suppression live in {@link INTERACTION_CSS} (Req 3.4, 4.3).
 */
@Directive({
  selector: '[guiFocusRing]',
  host: { class: 'gui-focus-ring' },
})
export class GuiFocusRingDirective implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly el = this.host.nativeElement;

  constructor() {
    this.focusMonitor
      .monitor(this.el)
      .pipe(takeUntilDestroyed())
      .subscribe((origin: FocusOrigin) =>
        this.el.classList.toggle('gui-focus-visible', origin === 'keyboard'),
      );
  }

  ngOnDestroy(): void {
    this.focusMonitor.stopMonitoring(this.el);
  }
}
