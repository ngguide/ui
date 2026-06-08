import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { GuiReducedMotion } from '@ngguide/ui/interaction';

/* ---------------------------------------------------------------------------
 * M3 loading-indicator shape morph.
 *
 * The M3 (Expressive) loading indicator is an indeterminate spinner whose active
 * indicator morphs through a looping sequence of seven distinct "Material shapes"
 * while the whole canvas rotates (see m3.material.io/components/loading-indicator
 * — the overview video is literally captioned "a looping sequence of morphs
 * between 7 different shapes"). The reference sequence is Material's
 * `IndeterminateIndicatorPolygons`:
 *
 *   soft burst → 9-sided cookie → pentagon → pill → sunny → 4-sided cookie → oval
 *
 * The canonical shapes come from `androidx.graphics.shapes` RoundedPolygons, which
 * we can't ship in pure SVG/CSS. We reconstruct each one parametrically: every
 * shape is sampled at the SAME number of points around the same angular sweep, so
 * a single SVG `<path>` can interpolate its `d` point-for-point between
 * consecutive shapes (SMIL `values` morph). Pure trig — no `Math.random`/
 * `Date.now()` — so the output is identical on every render (SSR-safe, stable for
 * hydration).
 *
 * Geometry: 48×48 canvas. The 38dp shape container leaves the active indicator a
 * little margin, so the shapes peak around radius ~17.5 (≈35dp) — matching the
 * reference, where the shape fills ~70% of the 48dp contained circle.
 * ------------------------------------------------------------------------- */

const CX = 24;
const CY = 24;
/** Samples per shape. Identical across shapes so `d` morphs point-for-point. */
const STEPS = 120;

type ShapeFn = (t: number) => readonly [number, number];

/** Scalloped cookie / sun / burst: radius modulated by `lobes` cosine waves. */
function radial(base: number, amp: number, lobes: number): ShapeFn {
  return (t) => {
    const r = base + amp * Math.cos(lobes * t);
    return [CX + r * Math.cos(t), CY + r * Math.sin(t)];
  };
}

/** Ellipse / oval — distinct semi-axes. */
function ellipse(rx: number, ry: number): ShapeFn {
  return (t) => [CX + rx * Math.cos(t), CY + ry * Math.sin(t)];
}

/**
 * Superellipse — a rounded rectangle / pill. `n` controls corner squareness
 * (2 = ellipse, larger = boxier); unequal axes give the capsule its long body.
 */
function superellipse(a: number, b: number, n: number): ShapeFn {
  const p = 2 / n;
  return (t) => {
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = Math.sign(c) * Math.pow(Math.abs(c), p) * a;
    const y = Math.sign(s) * Math.pow(Math.abs(s), p) * b;
    return [CX + x, CY + y];
  };
}

function buildPath(fn: ShapeFn): string {
  let d = '';
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    const [x, y] = fn(t);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d + 'Z';
}

/**
 * The seven M3 `IndeterminateIndicatorPolygons`, reconstructed parametrically.
 * Lobe counts and radii are tuned to the reference rendering (the 4- and 5-lobed
 * cookies, the fine ~12-point sun, and the upright oval are the most recognizable
 * frames of the loop). All peak at ≤ ~17.5 to stay inside the 38dp container.
 */
const SHAPES: readonly ShapeFn[] = [
  radial(13, 4.5, 10), // soft burst — 10 gentle lobes
  radial(12.5, 5, 9), // 9-sided cookie — deeper scallops
  radial(15.5, 2, 5), // pentagon — 5 soft corners
  superellipse(11, 17, 5), // pill — upright capsule
  radial(15, 2.5, 12), // sunny — 12 fine points
  radial(11.5, 6, 4), // 4-sided cookie — fat quatrefoil
  ellipse(12, 17), // oval — upright ellipse
];

const SHAPE_PATHS = SHAPES.map(buildPath);
/** Resting shape (also the reduced-motion / SSR static frame). */
const REST_PATH = SHAPE_PATHS[0];
/** SMIL morph cycle: each shape in turn, looping back to the first. */
const MORPH_VALUES = [...SHAPE_PATHS, SHAPE_PATHS[0]].join(';');
const MORPH_KEY_TIMES = SHAPE_PATHS.map((_, i) =>
  (i / SHAPE_PATHS.length).toFixed(4),
)
  .concat('1')
  .join(';');
/** One emphasized-easing segment per morph (one fewer than the value count). */
const MORPH_KEY_SPLINES = SHAPE_PATHS.map(() => '0.4 0 0.2 1').join(';');

/**
 * M3 loading indicator (SVG morphing shapes).
 *
 * An indeterminate, always-busy indicator: a single SVG `<path>` whose `d` morphs
 * through the seven M3 shapes (declarative SMIL) while the canvas spins (CSS).
 * Under `prefers-reduced-motion` the morph and spin stop at the resting shape
 * while the surface stays visible and `aria-busy`.
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
      <path class="gui-loading-shape" [attr.d]="restPath">
        @if (!reduced()) {
          <animate
            attributeName="d"
            [attr.values]="morphValues"
            [attr.keyTimes]="morphKeyTimes"
            [attr.keySplines]="morphKeySplines"
            dur="6s"
            repeatCount="indefinite"
            calcMode="spline"
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

  protected readonly restPath = REST_PATH;
  protected readonly morphValues = MORPH_VALUES;
  protected readonly morphKeyTimes = MORPH_KEY_TIMES;
  protected readonly morphKeySplines = MORPH_KEY_SPLINES;
  protected readonly reduced = computed(() =>
    this.reducedMotion.prefersReducedMotion(),
  );
}
