import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, inject, signal } from '@angular/core';
import { GuiOverlayHandle, GuiPickerOverlay } from '@ngguide/ui/overlay';
import { Observable, Subject } from 'rxjs';
import {
  GUI_SNACKBAR_CONTROLLER,
  GUI_SNACKBAR_DATA,
  GUI_SNACKBAR_DEFAULT_DURATION,
  GuiSnackbarCloseReason,
  GuiSnackbarConfig,
  GuiSnackbarController,
  GuiSnackbarData,
  GuiSnackbarRef,
  normalizeSnackbarConfig,
} from './snackbar-config';
import { GuiSnackbarSurface } from './snackbar';

/** Pixels of horizontal drag past which a pointer gesture dismisses the snackbar. */
const SWIPE_THRESHOLD = 80;
/** Bottom offset (px) used when lifting above a default-size bottom FAB. */
const ABOVE_FAB_OFFSET = '88px';
/** Viewport width (px) at/above which the snackbar aligns leading instead of centered. */
const LEADING_BREAKPOINT = 768;

class SnackbarRefImpl implements GuiSnackbarRef, GuiSnackbarController {
  private readonly afterDismissed$ = new Subject<GuiSnackbarCloseReason>();
  private readonly onAction$ = new Subject<void>();
  readonly afterDismissed: Observable<GuiSnackbarCloseReason> =
    this.afterDismissed$.asObservable();
  readonly onAction: Observable<void> = this.onAction$.asObservable();
  private settled = false;

  constructor(
    private readonly requestDismiss: (reason: GuiSnackbarCloseReason) => void,
  ) {}

  activateAction(): void {
    if (this.settled) {
      return;
    }
    this.onAction$.next();
    this.dismiss('action');
  }

  dismiss(reason: GuiSnackbarCloseReason = 'programmatic'): void {
    if (this.settled) {
      return;
    }
    this.requestDismiss(reason);
  }

  /** Called by the service once the overlay has been torn down. */
  settle(reason: GuiSnackbarCloseReason): void {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this.afterDismissed$.next(reason);
    this.afterDismissed$.complete();
    this.onAction$.complete();
  }
}

interface QueueEntry {
  config: GuiSnackbarConfig;
  data: GuiSnackbarData;
  ref: SnackbarRefImpl;
}

interface ActiveSnackbar {
  entry: QueueEntry;
  handle: GuiOverlayHandle;
  timerId: ReturnType<typeof setTimeout> | null;
  cleanup: () => void;
}

/**
 * M3 snackbar service. Shows one snackbar at a time (FIFO queue), anchored at the
 * bottom via {@link GuiPickerOverlay.openGlobalBottom} (no backdrop, no focus
 * theft). Announces politely through CDK `LiveAnnouncer`, auto-dismisses after a
 * configurable duration, pauses the timer while hovered/focused, and supports
 * swipe-to-dismiss.
 */
@Injectable({ providedIn: 'root' })
export class GuiSnackbar {
  private readonly overlay = inject(GuiPickerOverlay);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly queue = signal<QueueEntry[]>([]);
  private active: ActiveSnackbar | null = null;

  /** Enqueue a snackbar; shows immediately if nothing is open. Returns a ref. */
  open(config: GuiSnackbarConfig | string): GuiSnackbarRef {
    const { config: cfg, data } = normalizeSnackbarConfig(config);
    const ref = new SnackbarRefImpl((reason) =>
      this.handleDismiss(ref, reason),
    );
    const entry: QueueEntry = { config: cfg, data, ref };
    this.queue.update((q) => [...q, entry]);
    this.pump();
    return ref;
  }

  /** Dismiss the current snackbar and clear everything still queued. */
  dismissAll(): void {
    const activeEntry = this.active?.entry;
    const queued = this.queue().filter((e) => e !== activeEntry);
    this.queue.set(activeEntry ? [activeEntry] : []);
    for (const e of queued) {
      e.ref.settle('programmatic');
    }
    this.active?.entry.ref.dismiss('programmatic');
  }

  private pump(): void {
    if (this.active) {
      return;
    }
    const next = this.queue()[0];
    if (next) {
      this.show(next);
    }
  }

  private show(entry: QueueEntry): void {
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: GUI_SNACKBAR_DATA, useValue: entry.data },
        { provide: GUI_SNACKBAR_CONTROLLER, useValue: entry.ref },
      ],
    });
    const portal = new ComponentPortal(GuiSnackbarSurface, null, injector);
    const handle = this.overlay.openGlobalBottom(portal, {
      alignment: this.resolveAlignment(),
      bottomOffset: this.resolveBottomOffset(entry.config),
      maxWidth: '672px',
      panelClass: 'gui-snackbar-pane',
    });

    const active: ActiveSnackbar = {
      entry,
      handle,
      timerId: null,
      cleanup: () => undefined,
    };
    this.active = active;

    this.announcer.announce(
      entry.data.message,
      entry.config.politeness ?? 'polite',
    );

    const duration =
      entry.config.duration === undefined
        ? GUI_SNACKBAR_DEFAULT_DURATION
        : entry.config.duration;

    const clearTimer = () => {
      if (active.timerId != null) {
        clearTimeout(active.timerId);
        active.timerId = null;
      }
    };
    // Restart-on-resume (rather than tracking elapsed time) keeps the timer logic
    // free of Date.now and errs toward giving the user adequate time (req 9.7).
    const startTimer = () => {
      if (duration == null) {
        return;
      }
      active.timerId = setTimeout(
        () => entry.ref.dismiss('timeout'),
        duration,
      );
    };
    startTimer();

    const overlayEl = handle.ref.overlayElement;
    const onPause = () => clearTimer();
    const onResume = () => {
      clearTimer();
      startTimer();
    };
    overlayEl.addEventListener('pointerenter', onPause);
    overlayEl.addEventListener('focusin', onPause);
    overlayEl.addEventListener('pointerleave', onResume);
    overlayEl.addEventListener('focusout', onResume);

    let dragStartX = 0;
    let dragging = false;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      dragStartX = e.clientX;
    };
    const onUp = (e: PointerEvent) => {
      if (dragging && Math.abs(e.clientX - dragStartX) > SWIPE_THRESHOLD) {
        entry.ref.dismiss('swipe');
      }
      dragging = false;
    };
    overlayEl.addEventListener('pointerdown', onDown);
    overlayEl.addEventListener('pointerup', onUp);

    active.cleanup = () => {
      clearTimer();
      overlayEl.removeEventListener('pointerenter', onPause);
      overlayEl.removeEventListener('focusin', onPause);
      overlayEl.removeEventListener('pointerleave', onResume);
      overlayEl.removeEventListener('focusout', onResume);
      overlayEl.removeEventListener('pointerdown', onDown);
      overlayEl.removeEventListener('pointerup', onUp);
    };
  }

  private handleDismiss(
    ref: SnackbarRefImpl,
    reason: GuiSnackbarCloseReason,
  ): void {
    if (this.active && this.active.entry.ref === ref) {
      const active = this.active;
      active.cleanup();
      active.handle.close();
      this.active = null;
      this.queue.update((q) => q.filter((e) => e !== active.entry));
      ref.settle(reason);
      this.pump();
      return;
    }
    // Still queued (not yet shown): remove and settle without touching the overlay.
    const entry = this.queue().find((e) => e.ref === ref);
    if (entry) {
      this.queue.update((q) => q.filter((e) => e !== entry));
      ref.settle(reason);
    }
  }

  private resolveAlignment(): 'center' | 'leading' {
    if (typeof window !== 'undefined' && window.innerWidth >= LEADING_BREAKPOINT) {
      return 'leading';
    }
    return 'center';
  }

  private resolveBottomOffset(config: GuiSnackbarConfig): string | undefined {
    if (typeof config.aboveFab === 'string') {
      return config.aboveFab;
    }
    if (config.aboveFab) {
      return ABOVE_FAB_OFFSET;
    }
    return undefined;
  }
}
