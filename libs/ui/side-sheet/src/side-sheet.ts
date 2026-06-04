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
 * Side-sheet header (Req 10.4): an optional leading back-icon button, the
 * headline title, and a trailing close affordance. Project the close control
 * into `[guiSideSheetClose]` and, for the modal navigation pattern, an optional
 * back-icon button into `[guiSideSheetBack]`.
 *
 * Per M3 the start padding is 24dp, but drops to 16dp when a leading back icon
 * is present (`Start padding with icon`).
 */
@Component({
  selector: 'gui-side-sheet-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="gui-side-sheet-back"
      ><ng-content select="[guiSideSheetBack]"
    /></span>
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
        /* M3: 12dp between the top (header) elements. */
        gap: 12px;
        /* M3: 24dp start/end padding. */
        padding-block: 16px;
        padding-inline: 24px;
        flex: 0 0 auto;
      }
      /* M3: start padding drops to 16dp when a leading back icon is present. */
      :host:has(.gui-side-sheet-back > *) {
        padding-inline-start: 16px;
      }
      .gui-side-sheet-back:empty {
        display: none;
      }
      .gui-side-sheet-back {
        display: flex;
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

/**
 * Optional M3 divider that separates the headline from the content (and the
 * content from the bottom actions). Uses the `outline-variant` color role.
 * Place it between `gui-side-sheet-header`/`gui-side-sheet-content` as needed.
 */
@Component({
  selector: 'gui-side-sheet-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: { class: 'gui-side-sheet-divider', role: 'separator' },
  styles: [
    `
      :host {
        display: block;
        flex: 0 0 auto;
        height: 1px;
        border: none;
        background-color: var(--md-sys-color-outline-variant);
      }
    `,
  ],
})
export class GuiSideSheetDivider {}

/**
 * Scrollable content region between the header and the actions (Req 10.6).
 * Takes the remaining height of the sheet and scrolls its own overflow, so the
 * header and actions stay pinned. `min-height: 0` lets it shrink inside the
 * surface's flex column (without it, a flex item refuses to shrink below its
 * content and would push the actions off-screen).
 */
@Component({
  selector: 'gui-side-sheet-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { class: 'gui-side-sheet-content' },
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        /* M3: 24dp start/end padding. */
        padding: 0 24px;
      }
    `,
  ],
})
export class GuiSideSheetContent {}

/** Start-aligned action buttons region pinned to the sheet bottom (Req 10.4). */
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
        /* M3: bottom actions are left (start) aligned. */
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        /* M3: 72dp row height; 16dp top, 24dp bottom, 24dp start/end padding. */
        box-sizing: border-box;
        min-height: 72px;
        padding: 16px 24px 24px;
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
    // M3: the accessibility role for a side sheet is Dialog. The standard sheet
    // is non-modal (no focus trap), so aria-modal is false.
    role: 'dialog',
    'aria-modal': 'false',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-detached]': 'detached() ? "" : null',
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
  /**
   * M3 detached mode: float the sheet with a 16dp margin from the viewport
   * edges and round all four corners (default docked/flush).
   */
  readonly detached = input(false, { transform: booleanAttribute });
  /** Accessible name for the dialog role (use when there is no visible headline). */
  readonly ariaLabel = input<string | null>(null);
  /** Id of the headline element that labels the dialog. */
  readonly ariaLabelledby = input<string | null>(null);
  /** Reserved for API parity with the modal config. */
  readonly dismissible = input(true, { transform: booleanAttribute });
}
