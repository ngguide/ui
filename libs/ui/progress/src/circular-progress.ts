import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * M3 circular progress indicator (SVG rendering).
 *
 * - `value` in `0..1` ⇒ **determinate** arc (stroke-dasharray/offset, round caps).
 * - `value` `null` ⇒ **indeterminate** (rotating arc, paused under `prefers-reduced-motion`).
 *
 * Same ARIA contract as the linear variant: `aria-valuenow` only when determinate.
 */
@Component({
  selector: 'gui-circular-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gui-circular-progress',
    role: 'progressbar',
    '[attr.data-mode]': 'mode()',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? 100 : null',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? percent() : null',
  },
  template: `
    <svg
      class="gui-circular-svg"
      viewBox="0 0 48 48"
      focusable="false"
      aria-hidden="true"
    >
      <circle
        class="gui-circular-track"
        cx="24"
        cy="24"
        [attr.r]="radius"
        fill="none"
      />
      <circle
        class="gui-circular-active"
        cx="24"
        cy="24"
        [attr.r]="radius"
        fill="none"
        stroke-linecap="round"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset()"
      />
    </svg>
  `,
  styleUrl: './circular-progress.css',
})
export class GuiCircularProgress {
  /** 0..1. null ⇒ indeterminate. */
  readonly value = input<number | null>(null);
  readonly label = input<string>();

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  protected readonly mode = computed(() =>
    this.value() == null ? 'indeterminate' : 'determinate',
  );
  protected readonly clamped = computed(() =>
    Math.min(1, Math.max(0, this.value() ?? 0)),
  );
  protected readonly percent = computed(() => Math.round(this.clamped() * 100));
  protected readonly dashOffset = computed(
    () => CIRCUMFERENCE * (1 - this.clamped()),
  );
}
