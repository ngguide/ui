import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * M3 linear progress indicator (CSS rendering).
 *
 * - `value` in `0..1` ⇒ **determinate** (track + scaling active bar + stop indicator).
 * - `value` `null` ⇒ **indeterminate** (animated, paused under `prefers-reduced-motion`).
 *
 * Exposes `role="progressbar"` with `aria-valuemin/max/now` only when determinate;
 * indeterminate omits `aria-valuenow` per ARIA APG.
 */
@Component({
  selector: 'gui-linear-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gui-linear-progress',
    role: 'progressbar',
    '[attr.data-mode]': 'mode()',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? 100 : null',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? percent() : null',
  },
  template: `
    <div class="gui-linear-track"></div>
    <div class="gui-linear-active" [style.transform]="activeTransform()"></div>
    <div class="gui-linear-stop"></div>
  `,
  styleUrl: './linear-progress.css',
})
export class GuiLinearProgress {
  /** 0..1. null ⇒ indeterminate. */
  readonly value = input<number | null>(null);
  readonly label = input<string>();

  protected readonly mode = computed(() =>
    this.value() == null ? 'indeterminate' : 'determinate',
  );
  protected readonly clamped = computed(() =>
    Math.min(1, Math.max(0, this.value() ?? 0)),
  );
  protected readonly percent = computed(() => Math.round(this.clamped() * 100));
  protected readonly activeTransform = computed(
    () => `scaleX(${this.clamped()})`,
  );
}
