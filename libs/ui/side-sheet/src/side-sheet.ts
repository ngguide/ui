import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
} from '@angular/core';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/**
 * Side-sheet header (Req 10.4): a title with a trailing close affordance.
 * Project the close control into `[guiSideSheetClose]`.
 */
@Component({
  selector: 'gui-side-sheet-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="gui-side-sheet-title"><ng-content /></span>
    <span class="gui-side-sheet-close"
      ><ng-content select="[guiSideSheetClose]"
    /></span>
  `,
  host: { class: 'gui-side-sheet-header' },
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 16px;
        height: 56px;
        padding: 0 16px;
        flex: 0 0 auto;
      }
      .gui-side-sheet-title {
        flex: 1 1 auto;
        font-family: var(--md-sys-typescale-title-large-font);
        font-size: var(--md-sys-typescale-title-large-size);
        font-weight: var(--md-sys-typescale-title-large-weight);
        line-height: var(--md-sys-typescale-title-large-line-height);
        letter-spacing: var(--md-sys-typescale-title-large-tracking);
      }
      .gui-side-sheet-close {
        display: flex;
        flex: 0 0 auto;
      }
    `,
  ],
})
export class GuiSideSheetHeader {}

/** End-aligned action buttons region pinned to the sheet bottom (Req 10.4). */
@Component({
  selector: 'gui-side-sheet-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'gui-side-sheet-actions' },
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        padding: 16px;
        flex: 0 0 auto;
        margin-top: auto;
      }
    `,
  ],
})
export class GuiSideSheetActions {}

/**
 * M3 **standard** (non-modal) side sheet (Req 10.3). Rendered inline as a
 * fixed-position, end-docked surface that coexists with the page — **no scrim
 * and no focus trap** — so content behind it stays interactive. Toggle it with
 * the two-way `open` model. For a focus-trapping modal side sheet, use the
 * {@link GuiSideSheet} service instead.
 */
@Component({
  selector: 'gui-side-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="gui-side-sheet-surface"><ng-content /></div>`,
  styleUrl: './side-sheet.css',
  host: {
    class: 'gui-side-sheet-host',
    '[attr.data-variant]': 'variant()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.aria-hidden]': 'open() ? null : "true"',
    '[class.gui-no-motion]': 'reducedMotion.prefersReducedMotion()',
  },
})
export class GuiSideSheetSurface {
  protected readonly reducedMotion = inject(GuiReducedMotion);

  /** Surface mode. The inline component is `standard`; modal sheets use the service. */
  readonly variant = input<'modal' | 'standard'>('standard');
  /** Two-way open state (Req 10.3). */
  readonly open = model(false);
  /** Reserved for API parity with the modal config. */
  readonly dismissible = input(true, { transform: booleanAttribute });
}
