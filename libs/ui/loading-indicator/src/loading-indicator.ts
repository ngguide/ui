import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/**
 * Builds a deterministic "cookie" (multi-lobed rounded) path on a 48×48 canvas.
 * Pure trig — no `Math.random`/`Date.now`, so output is identical on every render
 * (SSR-safe and stable for hydration).
 */
function cookiePath(baseR: number, amp: number, lobes: number): string {
  const cx = 24;
  const cy = 24;
  const steps = 120;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = baseR + amp * Math.cos(lobes * t);
    const x = (cx + r * Math.cos(t)).toFixed(2);
    const y = (cy + r * Math.sin(t)).toFixed(2);
    d += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
  }
  return `${d}Z`;
}

// Two M3-inspired shapes the indicator morphs between. Same segment count/type so
// SMIL can interpolate `d` point-for-point.
const SHAPE_A = cookiePath(14, 4, 7);
const SHAPE_B = cookiePath(15, 3, 4);

/**
 * M3 loading indicator (SVG morphing shapes).
 *
 * An indeterminate, always-busy indicator: a single SVG `<path>` whose `d`
 * morphs between two deterministic shapes (declarative SMIL) while the canvas
 * spins (CSS). Under `prefers-reduced-motion` the morph and spin stop at a
 * resting shape while the surface stays visible and `aria-busy`.
 *
 * `role="progressbar"` with no `aria-valuenow` (indeterminate).
 */
@Component({
  selector: 'gui-loading-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'gui-loading-indicator',
    role: 'progressbar',
    'aria-busy': 'true',
    '[attr.data-variant]': 'variant()',
    '[attr.data-reduced-motion]': 'reduced() ? "true" : null',
    '[attr.aria-label]': 'label() || "Loading"',
  },
  template: `
    <svg
      class="gui-loading-svg"
      viewBox="0 0 48 48"
      focusable="false"
      aria-hidden="true"
    >
      <path class="gui-loading-shape" [attr.d]="shapeA">
        @if (!reduced()) {
          <animate
            attributeName="d"
            [attr.values]="morphValues"
            dur="1.2s"
            repeatCount="indefinite"
            calcMode="spline"
            keyTimes="0;0.5;1"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
        }
      </path>
    </svg>
  `,
  styleUrl: './loading-indicator.css',
})
export class GuiLoadingIndicator {
  private readonly reducedMotion = inject(GuiReducedMotion);

  readonly variant = input<'default' | 'contained'>('default');
  readonly label = input<string>();

  protected readonly shapeA = SHAPE_A;
  protected readonly morphValues = `${SHAPE_A};${SHAPE_B};${SHAPE_A}`;
  protected readonly reduced = computed(() =>
    this.reducedMotion.prefersReducedMotion(),
  );
}
