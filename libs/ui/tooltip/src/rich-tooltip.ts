import { ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { GuiOverlayHandle, GuiPickerOverlay } from '@ngguide/ui/overlay';
import { takeUntil } from 'rxjs';
import { GuiTooltipPosition, tooltipPositions } from './tooltip';

let nextRichId = 0;

/**
 * M3 rich tooltip panel. Projects an optional subhead (`[guiRichTooltipSubhead]`),
 * a default body, and optional actions (`[guiRichTooltipActions]`, up to two
 * `gui-button`s). Persistent and interactive — opened/closed by
 * {@link GuiRichTooltipTrigger}. `role="tooltip"`, surface-container color roles.
 */
@Component({
  selector: 'gui-rich-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template>
      <div class="gui-rich-tooltip" role="tooltip" [id]="id">
        <div class="gui-rich-tooltip-subhead">
          <ng-content select="[guiRichTooltipSubhead]" />
        </div>
        <div class="gui-rich-tooltip-body">
          <ng-content />
        </div>
        <div class="gui-rich-tooltip-actions">
          <ng-content select="[guiRichTooltipActions]" />
        </div>
      </div>
    </ng-template>
  `,
  styleUrl: './rich-tooltip.css',
})
export class GuiRichTooltip {
  private readonly vcr = inject(ViewContainerRef);
  private readonly tpl = viewChild.required(TemplateRef);

  readonly id = `gui-rich-tooltip-${nextRichId++}`;

  /** Build a fresh portal of the panel content for attachment into the overlay. */
  createPortal(): TemplatePortal {
    return new TemplatePortal(this.tpl(), this.vcr);
  }
}

/**
 * Opens a {@link GuiRichTooltip} connected to its host. Persistent: stays open
 * while the pointer is over the trigger OR the panel, closing only after a short
 * grace delay once the pointer is over neither. Escape — from anywhere, per WCAG
 * 2.2 SC 1.4.13 (Dismissible) — or a click inside the panel (e.g. an action)
 * closes it. Sets `aria-describedby` while open.
 */
@Directive({
  selector: '[guiRichTooltipTrigger]',
  host: {
    '[attr.aria-describedby]': 'open() ? panel().id : null',
    '(pointerenter)': 'onTriggerEnter()',
    '(pointerleave)': 'onTriggerLeave()',
    '(focusin)': 'onTriggerEnter()',
    '(focusout)': 'onTriggerLeave()',
  },
})
export class GuiRichTooltipTrigger {
  private readonly overlay = inject(GuiPickerOverlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** The panel this trigger controls. */
  readonly panel = input.required<GuiRichTooltip>({
    alias: 'guiRichTooltipTrigger',
  });
  readonly position = input<GuiTooltipPosition>('below');
  /** Grace period (ms) before closing once the pointer leaves both surfaces. */
  readonly closeDelay = input(150);

  protected readonly open = signal(false);

  private handle: GuiOverlayHandle | null = null;
  private overTrigger = false;
  private overPanel = false;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private panelEnter = () => this.setOverPanel(true);
  private panelLeave = () => this.setOverPanel(false);
  private panelClick = () => this.close();

  protected onTriggerEnter(): void {
    this.overTrigger = true;
    this.show();
  }

  protected onTriggerLeave(): void {
    this.overTrigger = false;
    this.scheduleClose();
  }

  private setOverPanel(over: boolean): void {
    this.overPanel = over;
    if (over) {
      this.cancelClose();
    } else {
      this.scheduleClose();
    }
  }

  private show(): void {
    if (this.open()) {
      this.cancelClose();
      return;
    }
    const positions: ConnectedPosition[] = tooltipPositions(this.position());
    const handle = this.overlay.openConnected(this.panel().createPortal(), {
      origin: this.host.nativeElement,
      positions,
      panelClass: 'gui-rich-tooltip-pane',
    });
    this.handle = handle;
    const el = handle.ref.overlayElement;
    el.addEventListener('pointerenter', this.panelEnter);
    el.addEventListener('pointerleave', this.panelLeave);
    el.addEventListener('click', this.panelClick);
    // Escape must close the tooltip even when focus is outside the trigger (e.g.
    // hover-opened, or focus moved into the panel) — WCAG 1.4.13. The CDK keyboard
    // dispatcher routes document-level keydowns to the top overlay.
    handle.ref
      .keydownEvents()
      .pipe(takeUntil(handle.closed))
      .subscribe((event) => {
        if (event.key === 'Escape') {
          this.close();
        }
      });
    this.open.set(true);
  }

  protected close(): void {
    this.cancelClose();
    if (!this.open()) {
      return;
    }
    if (this.handle) {
      const el = this.handle.ref.overlayElement;
      el.removeEventListener('pointerenter', this.panelEnter);
      el.removeEventListener('pointerleave', this.panelLeave);
      el.removeEventListener('click', this.panelClick);
      this.handle.close();
      this.handle = null;
    }
    this.overPanel = false;
    this.open.set(false);
  }

  private scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout(() => {
      if (!this.overTrigger && !this.overPanel) {
        this.close();
      }
    }, this.closeDelay());
  }

  private cancelClose(): void {
    if (this.closeTimer != null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
