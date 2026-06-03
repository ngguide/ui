import { ConfigurableFocusTrapFactory, FocusTrap } from '@angular/cdk/a11y';
import {
  ConnectedPosition,
  Overlay,
  OverlayRef,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import { Portal, TemplatePortal } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';

export interface GuiDockedConfig {
  origin: HTMLElement;
  width?: string;
}

export interface GuiModalConfig {
  ariaLabel?: string;
}

export interface GuiGlobalBottomConfig {
  /** Horizontal alignment of the bottom-anchored surface. Caller drives via breakpoint. */
  alignment?: 'center' | 'leading';
  /** Distance from the bottom edge, e.g. '16px' or an above-FAB offset. */
  bottomOffset?: string;
  /** Max inline width (M3 snackbar max width). */
  maxWidth?: string;
  panelClass?: string | string[];
}

export interface GuiConnectedConfig {
  origin: HTMLElement;
  /** Preferred connected positions (e.g. above-then-below for tooltips). */
  positions?: ConnectedPosition[];
  panelClass?: string | string[];
}

export interface GuiOverlayHandle {
  readonly ref: OverlayRef;
  readonly closed: Observable<void>;
  close(): void;
}

@Injectable({ providedIn: 'root' })
export class GuiPickerOverlay {
  private readonly overlay = inject(Overlay);
  private readonly focusTrapFactory = inject(ConfigurableFocusTrapFactory);

  openDocked(portal: TemplatePortal, cfg: GuiDockedConfig): GuiOverlayHandle {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(cfg.origin)
      .withPositions(STANDARD_DROPDOWN_BELOW_POSITIONS)
      .withViewportMargin(8);

    const ref = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      width: cfg.width,
    });

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const closed$ = new Subject<void>();
    const handle = this.makeHandle(ref, closed$, null, previouslyFocused);

    ref.attach(portal);
    ref.overlayElement.focus();

    ref
      .outsidePointerEvents()
      .pipe(takeUntil(closed$))
      .subscribe(() => handle.close());

    ref
      .keydownEvents()
      .pipe(takeUntil(closed$))
      .subscribe((event) => {
        if (event.key === 'Escape') {
          handle.close();
        }
      });

    return handle;
  }

  openModal(portal: TemplatePortal, cfg: GuiModalConfig): GuiOverlayHandle {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const ref = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'gui-overlay-scrim',
    });

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const closed$ = new Subject<void>();

    ref.attach(portal);

    if (cfg.ariaLabel) {
      ref.overlayElement.setAttribute('aria-label', cfg.ariaLabel);
    }

    const trap = this.focusTrapFactory.create(ref.overlayElement);
    trap.focusInitialElementWhenReady();

    const handle = this.makeHandle(ref, closed$, trap, previouslyFocused);

    ref
      .backdropClick()
      .pipe(takeUntil(closed$))
      .subscribe(() => handle.close());

    ref
      .keydownEvents()
      .pipe(takeUntil(closed$))
      .subscribe((event) => {
        if (event.key === 'Escape') {
          handle.close();
        }
      });

    return handle;
  }

  /**
   * Bottom-anchored floating surface (snackbar). GlobalPositionStrategy, NO backdrop,
   * NO focus trap, NO focus capture/restore — snackbars must not steal focus.
   * Scroll strategy: reposition.
   */
  openGlobalBottom(
    portal: Portal<unknown>,
    cfg: GuiGlobalBottomConfig = {},
  ): GuiOverlayHandle {
    const bottomOffset = cfg.bottomOffset ?? '16px';
    const positionBuilder = this.overlay
      .position()
      .global()
      .bottom(bottomOffset);

    const positionStrategy =
      cfg.alignment === 'leading'
        ? positionBuilder.left('16px')
        : positionBuilder.centerHorizontally();

    const ref = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      maxWidth: cfg.maxWidth,
      panelClass: cfg.panelClass,
    });

    const closed$ = new Subject<void>();
    const handle = this.makeHandle(ref, closed$, null, null);

    ref.attach(portal);

    return handle;
  }

  /**
   * Connected floating surface anchored to an origin (tooltips).
   * FlexibleConnectedPositionStrategy, NO backdrop, NO focus capture/restore —
   * tooltips must not move focus. Scroll strategy: reposition.
   */
  openConnected(
    portal: Portal<unknown>,
    cfg: GuiConnectedConfig,
  ): GuiOverlayHandle {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(cfg.origin)
      .withPositions(cfg.positions ?? STANDARD_DROPDOWN_BELOW_POSITIONS)
      .withViewportMargin(8);

    const ref = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: cfg.panelClass,
    });

    const closed$ = new Subject<void>();
    const handle = this.makeHandle(ref, closed$, null, null);

    ref.attach(portal);

    return handle;
  }

  private makeHandle(
    ref: OverlayRef,
    closed$: Subject<void>,
    trap: FocusTrap | null,
    previouslyFocused: HTMLElement | null,
  ): GuiOverlayHandle {
    let isClosed = false;

    const close = () => {
      if (isClosed) {
        return;
      }
      isClosed = true;

      trap?.destroy();
      ref.dispose();

      if (
        previouslyFocused &&
        previouslyFocused.isConnected &&
        typeof previouslyFocused.focus === 'function'
      ) {
        previouslyFocused.focus();
      }

      closed$.next();
      closed$.complete();
    };

    return {
      ref,
      closed: closed$.asObservable(),
      close,
    };
  }
}
