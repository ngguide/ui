import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/**
 * M3 **standard** (non-modal) bottom sheet (Req 9.2). Rendered inline as a
 * fixed-position surface that coexists with the page — **no scrim and no focus
 * trap** — so content behind it stays interactive and scrollable. Toggle it
 * with the two-way `open` model. Dragging the handle down past
 * `dismissThreshold` closes it (sets `open` to `false`); a shorter drag springs
 * back (Req 9.3, 9.4). For a focus-trapping modal sheet, use the
 * {@link GuiBottomSheet} service instead.
 */
@Component({
  selector: 'gui-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CdkDragHandle],
  template: `
    <div
      class="gui-bottom-sheet-surface"
      cdkDrag
      cdkDragLockAxis="y"
      (cdkDragEnded)="onDragEnded($event)"
    >
      @if (showDragHandle()) {
        <div class="gui-bottom-sheet-handle" cdkDragHandle aria-hidden="true"></div>
      }
      <div class="gui-bottom-sheet-body"><ng-content /></div>
    </div>
  `,
  styleUrl: './bottom-sheet.css',
  host: {
    class: 'gui-bottom-sheet-host',
    '[attr.data-variant]': 'variant()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.aria-hidden]': 'open() ? null : "true"',
    '[class.gui-no-motion]': 'reducedMotion.prefersReducedMotion()',
  },
})
export class GuiBottomSheetSurface {
  protected readonly reducedMotion = inject(GuiReducedMotion);

  /** Surface mode. The inline component is `standard`; modal sheets use the service. */
  readonly variant = input<'modal' | 'standard'>('standard');
  /** Two-way open state (Req 9.2). */
  readonly open = model(false);
  /** Show the drag handle. Default `true`. */
  readonly showDragHandle = input(true, { transform: booleanAttribute });
  /** Downward drag (px) past which the sheet closes. Default 96. */
  readonly dismissThreshold = input(96, { transform: numberAttribute });

  protected onDragEnded(event: CdkDragEnd): void {
    if (event.distance.y > this.dismissThreshold()) {
      this.open.set(false);
    }
    // Always reset the transform; visibility is driven by `open` + CSS.
    event.source.setFreeDragPosition({ x: 0, y: 0 });
  }
}
