import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragEnd,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/**
 * Default preset heights (as fractions of the viewport height) the sheet cycles
 * through when the drag handle is activated by keyboard/switch (Space/Enter).
 * Per M3 the handle must cycle the sheet through available heights without
 * relying on touch gestures.
 */
const GUI_BOTTOM_SHEET_DEFAULT_HEIGHTS = [0.5, 0.9] as const;

/**
 * M3 **standard** (non-modal) bottom sheet (Req 9.2). Rendered inline as a
 * fixed-position surface that coexists with the page — **no scrim and no focus
 * trap** — so content behind it stays interactive and scrollable. Toggle it
 * with the two-way `open` model. Dragging the handle down past
 * `dismissThreshold` closes it (sets `open` to `false`); a shorter drag springs
 * back (Req 9.3, 9.4). The drag handle is a focusable `role="button"` that
 * cycles the sheet through its preset `heights` on Space/Enter, providing a
 * non-touch resize affordance. For a focus-trapping modal sheet, use the
 * {@link GuiBottomSheet} service instead.
 */
@Component({
  selector: 'gui-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CdkDragHandle],
  template: `
    <div
      class="gui-bottom-sheet-surface"
      [style.--gui-bottom-sheet-height]="currentHeight()"
      cdkDrag
      cdkDragLockAxis="y"
      (cdkDragEnded)="onDragEnded($event)"
    >
      @if (showDragHandle()) {
        <button
          type="button"
          class="gui-bottom-sheet-handle"
          cdkDragHandle
          [attr.aria-label]="dragHandleLabel()"
          (keydown.space)="cycleHeight($event)"
          (keydown.enter)="cycleHeight($event)"
        ></button>
      }
      <div class="gui-bottom-sheet-body"><ng-content /></div>
    </div>
  `,
  styleUrl: './bottom-sheet.css',
  host: {
    class: 'gui-bottom-sheet-host',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.aria-hidden]': 'open() ? null : "true"',
    '[class.gui-no-motion]': 'reducedMotion.prefersReducedMotion()',
  },
})
export class GuiBottomSheetSurface {
  protected readonly reducedMotion = inject(GuiReducedMotion);

  /** Two-way open state (Req 9.2). */
  readonly open = model(false);
  /** Show the drag handle. Default `true`. */
  readonly showDragHandle = input(true, { transform: booleanAttribute });
  /** Downward drag (px) past which the sheet closes. Default 96. */
  readonly dismissThreshold = input(96, { transform: numberAttribute });
  /**
   * Preset heights, as fractions of the viewport height (0–1), the drag handle
   * cycles through when activated with a non-touch input (Space/Enter). M3
   * requires resizing without touch gestures.
   */
  readonly heights = input<readonly number[]>(GUI_BOTTOM_SHEET_DEFAULT_HEIGHTS);
  /** Accessible label for the drag-handle button (role `button` per M3). */
  readonly dragHandleLabel = input('Resize bottom sheet');

  /** Index into `heights()` of the currently selected preset. */
  private readonly heightIndex = signal(0);

  /** Current height as a CSS length (e.g. `50dvh`) for the surface. */
  protected readonly currentHeight = computed(() => {
    const presets = this.heights();
    if (presets.length === 0) {
      return '50dvh';
    }
    const fraction = presets[this.heightIndex() % presets.length];
    return `${Math.round(fraction * 100)}dvh`;
  });

  /**
   * Cycle to the next preset height (Space/Enter on the drag handle). This is
   * the single-pointer / keyboard alternative to dragging required by M3.
   */
  protected cycleHeight(event: Event): void {
    event.preventDefault();
    const count = this.heights().length;
    if (count <= 1) {
      return;
    }
    this.heightIndex.update((index) => (index + 1) % count);
  }

  protected onDragEnded(event: CdkDragEnd): void {
    if (event.distance.y > this.dismissThreshold()) {
      this.open.set(false);
    }
    // Clear the inline drag transform entirely so the CSS open/closed state
    // (`translateY(0)` vs `translateY(100%)`) drives the surface position and
    // animates. `setFreeDragPosition({0,0})` would leave an inline
    // `translate3d(0,0,0)` that overrides the closed `translateY(100%)`, so a
    // dismissed sheet would snap back into view instead of sliding away.
    event.source.reset();
  }
}
