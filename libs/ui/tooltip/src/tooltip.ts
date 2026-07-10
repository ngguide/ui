import { ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  InjectionToken,
  Injector,
  OnDestroy,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { GuiOverlayHandle, GuiPickerOverlay } from '@ngguide/ui/overlay';
import { takeUntil } from 'rxjs';

export type GuiTooltipPosition = 'above' | 'below' | 'before' | 'after';

let nextId = 0;

interface GuiTooltipPanelData {
  message: string;
  id: string;
  position: GuiTooltipPosition;
}

const GUI_TOOLTIP_DATA = new InjectionToken<GuiTooltipPanelData>(
  'GUI_TOOLTIP_DATA',
);

/** Connected positions for each tooltip placement, with a sensible fallback. */
export function tooltipPositions(
  position: GuiTooltipPosition,
): ConnectedPosition[] {
  const gap = 8;
  switch (position) {
    case 'below':
      return [
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: gap },
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -gap },
      ];
    case 'before':
      return [
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -gap },
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: gap },
      ];
    case 'after':
      return [
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: gap },
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -gap },
      ];
    case 'above':
    default:
      return [
        { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -gap },
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: gap },
      ];
  }
}

/** The plain-tooltip panel rendered into the overlay (non-interactive). */
@Component({
  selector: 'gui-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gui-tooltip',
    role: 'tooltip',
    '[id]': 'data.id',
    '[attr.data-position]': 'data.position',
  },
  template: `{{ data.message }}`,
  styleUrl: './tooltip.css',
})
export class GuiTooltipPanel {
  protected readonly data = inject(GUI_TOOLTIP_DATA);
}

/**
 * M3 plain tooltip — a short, non-interactive label shown on hover / focus /
 * long-press. Sets `aria-describedby` on the trigger while visible (APG). Escape
 * dismisses it from anywhere — even when it was opened by hover and focus sits
 * elsewhere (WCAG 2.2 SC 1.4.13, Dismissible) — without moving focus. The listener
 * lives on the overlay (document-scoped via the CDK keyboard dispatcher), not the
 * host, so the key reaches it regardless of where focus is.
 */
@Directive({
  selector: '[guiTooltip]',
  host: {
    '[attr.aria-describedby]': 'describedBy()',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave()',
    '(focusin)': 'scheduleShow()',
    '(focusout)': 'hide()',
    '(pointerdown)': 'onPointerDown()',
    '(pointerup)': 'cancelLongPress()',
  },
})
export class GuiTooltip implements OnDestroy {
  private readonly overlay = inject(GuiPickerOverlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly message = input<string>('', { alias: 'guiTooltip' });
  readonly position = input<GuiTooltipPosition>('above');
  readonly showDelay = input(500);
  readonly hideDelay = input(0);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly visible = signal(false);
  protected readonly tooltipId = `gui-tooltip-${nextId++}`;
  protected readonly describedBy = computed(() =>
    this.visible() ? this.tooltipId : null,
  );

  private handle: GuiOverlayHandle | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  protected onPointerEnter(): void {
    this.scheduleShow();
  }

  protected onPointerLeave(): void {
    this.cancelLongPress();
    this.hide();
  }

  protected onPointerDown(): void {
    // Touch long-press path.
    this.longPressTimer = setTimeout(() => this.show(), this.showDelay());
  }

  protected cancelLongPress(): void {
    if (this.longPressTimer != null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  protected scheduleShow(): void {
    if (!this.canShow()) {
      return;
    }
    this.clearTimers();
    const delay = this.showDelay();
    if (delay <= 0) {
      this.show();
    } else {
      this.showTimer = setTimeout(() => this.show(), delay);
    }
  }

  protected hide(): void {
    this.clearTimers();
    if (!this.visible()) {
      return;
    }
    const delay = this.hideDelay();
    if (delay <= 0) {
      this.close();
    } else {
      this.hideTimer = setTimeout(() => this.close(), delay);
    }
  }

  private canShow(): boolean {
    return !this.disabled() && this.message().trim().length > 0;
  }

  private show(): void {
    if (!this.canShow() || this.visible()) {
      return;
    }
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: GUI_TOOLTIP_DATA,
          useValue: {
            message: this.message(),
            id: this.tooltipId,
            position: this.position(),
          } satisfies GuiTooltipPanelData,
        },
      ],
    });
    const portal = new ComponentPortal(GuiTooltipPanel, null, injector);
    const handle = this.overlay.openConnected(portal, {
      origin: this.host.nativeElement,
      positions: tooltipPositions(this.position()),
      panelClass: 'gui-tooltip-pane',
    });
    this.handle = handle;
    // Escape must dismiss the tooltip even when it was hover-opened and focus is
    // elsewhere (WCAG 1.4.13). The CDK keyboard dispatcher routes document-level
    // keydowns to the top overlay, so listen here rather than on the host.
    handle.ref
      .keydownEvents()
      .pipe(takeUntil(handle.closed))
      .subscribe((event) => {
        if (event.key === 'Escape') {
          this.close();
        }
      });
    this.visible.set(true);
  }

  private close(): void {
    this.handle?.close();
    this.handle = null;
    this.visible.set(false);
  }

  private clearTimers(): void {
    if (this.showTimer != null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer != null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.cancelLongPress();
    this.close();
  }
}
