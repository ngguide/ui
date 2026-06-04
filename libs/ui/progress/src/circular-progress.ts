import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { GuiProgressShape } from './linear-progress';

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * M3 circular progress indicator (SVG rendering).
 *
 * - `value` in `0..1` ⇒ **determinate** arc (stroke-dasharray/offset, round caps).
 * - `value` `null` ⇒ **indeterminate** (a growing/shrinking arc that also rotates,
 *   paused under `prefers-reduced-motion`).
 *
 * M3 Expressive configurations:
 * - `thickness` overrides the default 4dp stroke (variable thickness).
 * - `shape="wavy"` applies a wave to the active indicator, driven by `amplitude`
 *   and `wavelength`.
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
    '[attr.data-shape]': 'shape()',
    '[style.--_stroke.px]': 'thickness()',
    '[attr.aria-label]': 'ariaLabel()',
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
      @if (shape() === 'wavy') {
        <path
          class="gui-circular-active"
          [attr.d]="wavePath()"
          fill="none"
          stroke-linecap="round"
          [attr.stroke-dasharray]="waveLength()"
          [attr.stroke-dashoffset]="waveDashOffset()"
        />
      } @else {
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
      }
    </svg>
  `,
  styleUrl: './circular-progress.css',
})
export class GuiCircularProgress {
  /** 0..1. null ⇒ indeterminate. */
  readonly value = input<number | null>(null);
  readonly label = input<string>();
  /** Stroke thickness in dp/px. Defaults to the M3 baseline of 4dp. */
  readonly thickness = input<number>(4);
  /** M3 Expressive shape. `wavy` applies a wave to the active indicator. */
  readonly shape = input<GuiProgressShape>('flat');
  /** Wave amplitude (peak height) in dp/px. Used only when `shape="wavy"`. */
  readonly amplitude = input<number>(2);
  /** Wave wavelength (distance between peaks) in dp/px. Used only when `shape="wavy"`. */
  readonly wavelength = input<number>(12);

  protected readonly radius = RADIUS;
  protected readonly circumference = CIRCUMFERENCE;

  protected readonly mode = computed(() =>
    this.value() == null ? 'indeterminate' : 'determinate',
  );
  /**
   * A progressbar must have an accessible name (M3 a11y / ARIA). When no `label`
   * is supplied we fall back to a generic process description so the indicator is
   * never nameless; consumers should set `label` to the actual process.
   */
  protected readonly ariaLabel = computed(() => this.label() || 'Loading');
  protected readonly clamped = computed(() =>
    Math.min(1, Math.max(0, this.value() ?? 0)),
  );
  protected readonly percent = computed(() => Math.round(this.clamped() * 100));
  protected readonly dashOffset = computed(
    () => CIRCUMFERENCE * (1 - this.clamped()),
  );

  // --- Wavy shape (M3 Expressive) ---

  /** A wavy ring: a sine wave wrapped around the circle at `radius`. */
  protected readonly wavePath = computed(() => {
    const cx = 24;
    const cy = 24;
    const r = this.radius;
    const amp = this.amplitude();
    const wl = Math.max(1, this.wavelength());
    // Number of full waves around the circumference; rounded so the ring closes.
    const waves = Math.max(1, Math.round((2 * Math.PI * r) / wl));
    const steps = waves * 24;
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      const rr = r + amp * Math.sin(waves * t);
      const x = cx + rr * Math.cos(t - Math.PI / 2);
      const y = cy + rr * Math.sin(t - Math.PI / 2);
      d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)} `;
    }
    return d.trim();
  });
  /** Approximate drawn length of the wavy ring, for stroke-dash progress. */
  protected readonly waveLength = computed(() => {
    const ratio = this.amplitude() / Math.max(1, this.wavelength());
    const factor = 1 + 2 * Math.PI * Math.PI * ratio * ratio;
    return CIRCUMFERENCE * factor;
  });
  protected readonly waveDashOffset = computed(
    () => this.waveLength() * (1 - this.clamped()),
  );
}
