import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * Tiny inline-SVG trend line — no chart library (Decision 4C). Maps a fixed
 * `number[]` to a normalized polyline in a 100×28 viewBox, stroked with the M3
 * primary role. Marked `role="img"` with a caller-supplied label so the trend
 * is announced to assistive tech (R10).
 */
@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="spark"
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      role="img"
      [attr.aria-label]="ariaLabel()"
    >
      <polyline
        [attr.points]="points()"
        fill="none"
        stroke="var(--md-sys-color-primary)"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .spark {
        display: block;
        width: 100%;
        height: 28px;
      }
    `,
  ],
})
export class SparklineComponent {
  readonly values = input.required<number[]>();
  readonly ariaLabel = input('Trend');

  protected readonly points = computed(() => {
    const vals = this.values();
    if (vals.length === 0) return '';
    const w = 100;
    const h = 28;
    const pad = 2;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const stepX = vals.length > 1 ? (w - pad * 2) / (vals.length - 1) : 0;
    return vals
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = pad + (h - pad * 2) * (1 - (v - min) / range);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });
}
