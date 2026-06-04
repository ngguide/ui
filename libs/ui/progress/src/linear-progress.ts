import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** M3 progress indicator shape. Wavy is an M3 Expressive configuration. */
export type GuiProgressShape = 'flat' | 'wavy';

/**
 * M3 linear progress indicator (CSS rendering).
 *
 * - `value` in `0..1` ⇒ **determinate** (gapped track + active bar + stop indicator).
 * - `value` `null` ⇒ **indeterminate** (two sequenced active bands, paused under
 *   `prefers-reduced-motion`).
 *
 * M3 Expressive configurations:
 * - `thickness` overrides the default 4dp track height (variable thickness).
 * - `shape="wavy"` applies a wave to the active indicator, driven by `amplitude`
 *   and `wavelength`.
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
    '[attr.data-shape]': 'shape()',
    '[style.--_track-height.px]': 'thickness()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? 0 : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? 100 : null',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? percent() : null',
  },
  template: `
    @if (shape() === 'wavy') {
      <svg
        class="gui-linear-wave"
        [attr.viewBox]="waveViewBox()"
        preserveAspectRatio="none"
        focusable="false"
        aria-hidden="true"
      >
        <path
          class="gui-linear-wave-track"
          [attr.d]="wavePath()"
          fill="none"
        />
        <path
          class="gui-linear-wave-active"
          [attr.d]="wavePath()"
          [attr.stroke-dasharray]="waveLength()"
          [attr.stroke-dashoffset]="waveDashOffset()"
          fill="none"
        />
      </svg>
    } @else {
      <div class="gui-linear-track" [style.transform]="trackTransform()"></div>
      <div class="gui-linear-active" [style.transform]="activeTransform()"></div>
      <div class="gui-linear-stop"></div>
    }
  `,
  styleUrl: './linear-progress.css',
})
export class GuiLinearProgress {
  /** 0..1. null ⇒ indeterminate. */
  readonly value = input<number | null>(null);
  readonly label = input<string>();
  /** Track thickness in dp/px. Defaults to the M3 baseline of 4dp. */
  readonly thickness = input<number>(4);
  /** M3 Expressive shape. `wavy` applies a wave to the active indicator. */
  readonly shape = input<GuiProgressShape>('flat');
  /** Wave amplitude (peak height) in dp/px. Used only when `shape="wavy"`. */
  readonly amplitude = input<number>(3);
  /** Wave wavelength (distance between peaks) in dp/px. Used only when `shape="wavy"`. */
  readonly wavelength = input<number>(40);

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
  protected readonly activeTransform = computed(
    () => `scaleX(${this.clamped()})`,
  );
  /**
   * The track is the inactive segment shown ahead of the active indicator, with
   * a gap between the active end and the track for higher track/active contrast
   * (M3 Dec-2023 redesign). It occupies the remaining `1 - value` of the bar.
   */
  protected readonly trackTransform = computed(
    () => `scaleX(${1 - this.clamped()})`,
  );

  // --- Wavy shape (M3 Expressive) ---

  /** Logical wave drawing width; the SVG stretches it to the host via viewBox. */
  protected readonly waveWidth = 240;
  protected readonly waveViewBox = computed(() => {
    const h = this.amplitude() * 2 + this.thickness();
    return `0 0 ${this.waveWidth} ${h}`;
  });
  /** A sine-like wave path drawn left-to-right across the logical width. */
  protected readonly wavePath = computed(() => {
    const width = this.waveWidth;
    const amp = this.amplitude();
    const wl = Math.max(1, this.wavelength());
    const mid = amp + this.thickness() / 2;
    // Quadratic-segment sine: alternate control points above/below the midline,
    // one half-wavelength per segment.
    const half = wl / 2;
    let d = `M 0 ${mid}`;
    let x = 0;
    let up = true;
    while (x < width) {
      const nextX = Math.min(x + half, width);
      const cx = (x + nextX) / 2;
      const cy = up ? mid - amp * 2 : mid + amp * 2;
      d += ` Q ${cx} ${cy} ${nextX} ${mid}`;
      x = nextX;
      up = !up;
    }
    return d;
  });
  /** Approximate drawn length of the wave path, for stroke-dash progress. */
  protected readonly waveLength = computed(() => {
    // Arc length of the sine approximation ≈ width * (1 + 2*(amp/wavelength)^2 * pi^2)
    const ratio = this.amplitude() / Math.max(1, this.wavelength());
    const factor = 1 + 2 * Math.PI * Math.PI * ratio * ratio;
    return this.waveWidth * factor;
  });
  protected readonly waveDashOffset = computed(
    () => this.waveLength() * (1 - this.clamped()),
  );
}
