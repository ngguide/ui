/**
 * M3 carousel keyline engine — a faithful port of the Compose Material 3
 * `androidx.compose.material3.carousel` *keyline-strategy* model (the M3 spec
 * site documents the behaviour but not the algorithm; the algorithm lives in
 * Compose `Strategy` / `KeylineList`). Pure and deterministic — no `Date.now`,
 * no `Math.random`, no DOM — so it is SSR-safe (Req 16.4). The runtime
 * ({@link GuiCarousel}) feeds it the measured viewport width + the scroll
 * offset and applies the resulting per-item size / center / parallax.
 *
 * Core idea (Compose model):
 *  - Items live in an *unadjusted* (full-size) scroll space where every item
 *    nominally occupies `large + spacing`. An item's unadjusted center at scroll
 *    `s` is `leadingPadding + index * (large + spacing) + large/2 - s`.
 *  - A {@link KeylineList} maps positions in that space to a rendered `size` and
 *    on-screen `center`: a run of focal (large) keylines, flanked by a medium /
 *    small taper toward the edges and off-screen `anchor` keylines.
 *  - Each item's rendered size + center is the linear interpolation of the two
 *    keylines bracketing its unadjusted center → items continuously *change size
 *    as they move through the carousel* (the M3 morph) and snap to the focal
 *    keyline.
 *  - Content parallax = the symmetric mask inset `(large - size) / 2`: as a frame
 *    shrinks, its content is cropped equally on both sides (never shifted out of
 *    the frame), so content moves at a different speed than the frame.
 */
export type GuiCarouselLayout =
  | 'multi-browse'
  | 'uncontained'
  | 'uncontained-multi-aspect'
  | 'hero'
  | 'center-aligned-hero'
  | 'full-screen';

/**
 * How a layout distributes its items along the scroll axis. Most layouts are
 * `start`-aligned; the hero layout can be `center`-aligned (the focal item
 * centered with a small peek on each side) and full-screen is always centered.
 */
export type GuiCarouselAlignment = 'start' | 'center';

/** dp — smallest a small carousel item may shrink to (M3: CarouselDefaults.MinSmallItemSize). */
export const MIN_SMALL_ITEM = 40;
/** dp — largest a small carousel item may grow to (M3: CarouselDefaults.MaxSmallItemSize). */
export const MAX_SMALL_ITEM = 56;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

/**
 * A fixed position on the carousel's scrolling axis (Compose `Keyline`). An item
 * whose unadjusted center lands here renders at `size`, centered at `offset`.
 */
export interface Keyline {
  /** Rendered main-axis size (px) of an item centered at this keyline. */
  size: number;
  /** Viewport-relative center (px) where the item is drawn. */
  offset: number;
  /** Center (px) in the end-to-end full-size layout (all items at `large`). */
  unadjustedOffset: number;
  /** Whether an item is "fully viewable" (large) at this keyline. */
  isFocal: boolean;
  /** Off-screen anchor keyline — fixed, never enters the focal range. */
  isAnchor: boolean;
}

export interface KeylineList {
  keylines: Keyline[];
  firstFocal: number;
  lastFocal: number;
}

/** The rendered geometry of one carousel item at the current scroll offset. */
export interface ItemPlacement {
  /** Rendered main-axis size (px). */
  size: number;
  /** Viewport-relative center (px). */
  center: number;
  /** Content crop each side (px) = (large - size) / 2 — the M3 parallax. */
  maskInset: number;
  /** True when the item is fully outside the viewport (can be hidden). */
  offscreen: boolean;
}

export interface ArrangeOptions {
  preferredLargeWidth: number;
  itemSpacing: number;
  itemCount: number;
  alignment: GuiCarouselAlignment;
  /** Leading inline padding (px) — 16dp for most layouts, 0 for full-screen. */
  leadingPadding: number;
  /** Trailing inline padding (px) — 16dp for padded layouts, 0 otherwise. */
  trailingPadding: number;
}

export interface CarouselStrategy {
  layout: GuiCarouselLayout;
  /** The "large" item size used as the unadjusted (full-size) scroll stride. */
  large: number;
  itemSpacing: number;
  itemCount: number;
  /** The default (resting) keyline list. */
  keylines: KeylineList;
  /** Full-size scroll extent the native scroller must expose (px). */
  contentExtent: number;
  /** Largest reachable scroll offset (px). */
  maxScrollOffset: number;
  /** Scroll offset (px) that snaps item `i` onto the first focal keyline. */
  snapOffsets: number[];
}

/** small = clamp(large / 3, 40, 56) — fills 40–56dp dynamically (M3). */
function smallFor(large: number): number {
  return clamp(large / 3, MIN_SMALL_ITEM, MAX_SMALL_ITEM);
}

/**
 * Assemble a {@link KeylineList} from an ordered size list and the focal range.
 * `offset` (viewport coords) is walked outward from the focal pivot using the
 * real per-keyline sizes; `unadjustedOffset` is walked with the constant `large`
 * stride so it shares the item scroll space (`index * (large + spacing)`).
 */
function assemble(
  sizes: number[],
  isFocal: boolean[],
  isAnchor: boolean[],
  firstFocal: number,
  lastFocal: number,
  pivotOffset: number,
  unadjustedPivot: number,
  spacing: number,
  large: number,
): KeylineList {
  const n = sizes.length;
  const offset = new Array<number>(n);
  const unadjusted = new Array<number>(n);
  offset[firstFocal] = pivotOffset;
  unadjusted[firstFocal] = unadjustedPivot;
  // Forward from the pivot.
  for (let i = firstFocal + 1; i < n; i++) {
    offset[i] = offset[i - 1] + sizes[i - 1] / 2 + spacing + sizes[i] / 2;
    unadjusted[i] = unadjusted[i - 1] + large + spacing;
  }
  // Backward from the pivot.
  for (let i = firstFocal - 1; i >= 0; i--) {
    offset[i] = offset[i + 1] - sizes[i + 1] / 2 - spacing - sizes[i] / 2;
    unadjusted[i] = unadjusted[i + 1] - large - spacing;
  }
  const keylines: Keyline[] = sizes.map((size, i) => ({
    size,
    offset: offset[i],
    unadjustedOffset: unadjusted[i],
    isFocal: isFocal[i],
    isAnchor: isAnchor[i],
  }));
  return { keylines, firstFocal, lastFocal };
}

/**
 * Build the default keyline list for a layout at a given viewport width.
 * The arrangement always carries an off-screen `anchor` (small) keyline at each
 * end so items can morph in/out of view, a contiguous run of focal (large)
 * keylines, and the medium/small taper required by the layout.
 */
function defaultKeylines(
  layout: GuiCarouselLayout,
  viewport: number,
  opts: ArrangeOptions,
): KeylineList {
  const { preferredLargeWidth, itemSpacing, itemCount, leadingPadding } = opts;
  const large = Math.min(preferredLargeWidth, viewport);
  const small = Math.min(smallFor(large), viewport);
  const medium = (large + small) / 2;
  const anchor = small;
  const startPivotOffset = leadingPadding + large / 2;
  const unadjustedPivot = leadingPadding + large / 2;

  if (
    layout === 'uncontained' ||
    layout === 'uncontained-multi-aspect' ||
    layout === 'full-screen'
  ) {
    // Uniform arrangement — items keep a single (large / viewport) size and the
    // trailing item is clipped by the container; no per-scroll keyline morph.
    // The focal run spans enough slots to cover the viewport so every visible
    // item samples a `large` keyline.
    const slots = Math.max(1, Math.ceil(viewport / (large + itemSpacing)) + 1);
    const sizes = [anchor];
    const focal: boolean[] = [false];
    const anch: boolean[] = [true];
    for (let i = 0; i < slots; i++) {
      sizes.push(large);
      focal.push(true);
      anch.push(false);
    }
    sizes.push(anchor);
    focal.push(false);
    anch.push(true);
    return assemble(sizes, focal, anch, 1, slots, startPivotOffset, unadjustedPivot, itemSpacing, large);
  }

  if (layout === 'hero') {
    // [anchor] large(focal) small [anchor] — one large + one trailing peek. The
    // hero large is dynamic: it fills the viewport beside the small peek (M3:
    // "Large item width: Dynamic"; hero scrolls one large at a time).
    const heroLarge = Math.max(
      small,
      viewport - leadingPadding - itemSpacing - small,
    );
    const heroPivot = leadingPadding + heroLarge / 2;
    const sizes = [anchor, heroLarge, small, anchor];
    const focal = [false, true, false, false];
    const anch = [true, false, false, true];
    return assemble(sizes, focal, anch, 1, 1, heroPivot, heroPivot, itemSpacing, heroLarge);
  }

  if (layout === 'center-aligned-hero') {
    // [anchor] small large(focal) small [anchor] — large centered, peek each
    // side. The large is dynamic, filling the viewport between the two peeks.
    const chLarge = Math.max(small, viewport - 2 * (small + itemSpacing));
    const sizes = [anchor, small, chLarge, small, anchor];
    const focal = [false, false, true, false, false];
    const anch = [true, false, false, false, true];
    const pivot = viewport / 2; // the focal large is centered
    const chUnadjusted = leadingPadding + chLarge / 2;
    return assemble(sizes, focal, anch, 2, 2, pivot, chUnadjusted, itemSpacing, chLarge);
  }

  // multi-browse: [anchor] large×k medium small [anchor] — pack as many large
  // items as fit, then one medium + one small toward the trailing edge.
  // Room for the focal run after reserving a medium + small + the anchors/gaps.
  const reserved = medium + small + itemSpacing * 3 + leadingPadding;
  let largeCount = Math.max(1, Math.floor((viewport - reserved) / (large + itemSpacing)));
  // Never lay out more focal slots than there are items.
  largeCount = Math.min(largeCount, Math.max(1, itemCount));
  const hasMedium = itemCount > largeCount && large >= 2 * small;
  const hasSmall = itemCount > largeCount + (hasMedium ? 1 : 0);

  const sizes: number[] = [anchor];
  const focal: boolean[] = [false];
  const anch: boolean[] = [true];
  for (let i = 0; i < largeCount; i++) {
    sizes.push(large);
    focal.push(true);
    anch.push(false);
  }
  if (hasMedium) {
    sizes.push(medium);
    focal.push(false);
    anch.push(false);
  }
  if (hasSmall) {
    sizes.push(small);
    focal.push(false);
    anch.push(false);
  }
  sizes.push(anchor);
  focal.push(false);
  anch.push(true);
  const firstFocal = 1;
  const lastFocal = largeCount; // contiguous focal run [1 .. largeCount]
  return assemble(sizes, focal, anch, firstFocal, lastFocal, startPivotOffset, unadjustedPivot, itemSpacing, large);
}

/**
 * Build the scroll strategy (resting keylines + scroll extent + snap points) for
 * a layout. Uncontained / full-screen use a uniform arrangement (no per-scroll
 * keyline morph — items are clipped/filled at the edge per M3).
 */
export function buildStrategy(
  layout: GuiCarouselLayout,
  viewport: number,
  opts: ArrangeOptions,
): CarouselStrategy {
  const { itemSpacing, itemCount } = opts;
  const empty: CarouselStrategy = {
    layout,
    large: 0,
    itemSpacing,
    itemCount,
    keylines: { keylines: [], firstFocal: 0, lastFocal: 0 },
    contentExtent: 0,
    maxScrollOffset: 0,
    snapOffsets: [],
  };
  if (viewport <= 0 || itemCount <= 0) {
    return empty;
  }

  const keylines = defaultKeylines(layout, viewport, opts);
  const ks = keylines.keylines;
  // The focal keyline size is the layout's large (dynamic for hero/center-hero).
  const large = ks[keylines.firstFocal].size;
  const stride = large + itemSpacing;
  const pivotUnadjusted = ks[keylines.firstFocal].unadjustedOffset;

  // Scroll the run until the LAST item rests on the last non-anchor (trailing
  // peek) keyline: that fills the focal range with the final items and leaves no
  // trailing gap. (A lightweight, analytic stand-in for Compose's end steps.)
  let lastNonAnchor = ks.length - 1;
  while (lastNonAnchor > 0 && ks[lastNonAnchor].isAnchor) {
    lastNonAnchor--;
  }
  const lastItemUnadjusted = pivotUnadjusted + (itemCount - 1) * stride;
  const maxScrollOffset = Math.max(
    0,
    lastItemUnadjusted - ks[lastNonAnchor].unadjustedOffset,
  );
  // The native spacer must be exactly long enough to reach maxScrollOffset.
  const contentExtent = maxScrollOffset + viewport;

  // Each item snaps so its unadjusted center sits on the first focal keyline.
  const snapOffsets: number[] = [];
  for (let i = 0; i < itemCount; i++) {
    snapOffsets.push(clamp(i * stride, 0, maxScrollOffset));
  }

  return {
    layout,
    large,
    itemSpacing,
    itemCount,
    keylines,
    contentExtent,
    maxScrollOffset,
    snapOffsets,
  };
}

/**
 * Interpolate the keyline pair bracketing `unadjustedCenter` and return the
 * rendered size + on-screen center. Centers outside the keyline span clamp to
 * the nearest (anchor) keyline.
 */
function sampleKeylines(
  list: KeylineList,
  unadjustedCenter: number,
): { size: number; center: number } {
  const ks = list.keylines;
  if (ks.length === 0) {
    return { size: 0, center: 0 };
  }
  if (unadjustedCenter <= ks[0].unadjustedOffset) {
    return { size: ks[0].size, center: ks[0].offset };
  }
  const last = ks[ks.length - 1];
  if (unadjustedCenter >= last.unadjustedOffset) {
    return { size: last.size, center: last.offset };
  }
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (unadjustedCenter >= a.unadjustedOffset && unadjustedCenter <= b.unadjustedOffset) {
      const span = b.unadjustedOffset - a.unadjustedOffset || 1;
      const f = (unadjustedCenter - a.unadjustedOffset) / span;
      return { size: lerp(a.size, b.size, f), center: lerp(a.offset, b.offset, f) };
    }
  }
  return { size: last.size, center: last.offset };
}

/**
 * Place every item at the given scroll offset. Returns one {@link ItemPlacement}
 * per item, in index order.
 */
export function placeItems(
  strategy: CarouselStrategy,
  scrollOffset: number,
  viewport: number,
): ItemPlacement[] {
  const { keylines, large, itemSpacing, itemCount } = strategy;
  if (large <= 0 || itemCount <= 0) {
    return Array.from({ length: Math.max(0, itemCount) }, () => ({
      size: 0,
      center: 0,
      maskInset: 0,
      offscreen: true,
    }));
  }
  const stride = large + itemSpacing;
  const pivotUnadjusted = keylines.keylines[keylines.firstFocal].unadjustedOffset;
  const placements: ItemPlacement[] = [];
  for (let i = 0; i < itemCount; i++) {
    // Unadjusted center of item i at this scroll offset (focal at snapOffsets[i]).
    const unadjustedCenter = pivotUnadjusted + i * stride - scrollOffset;
    const { size, center } = sampleKeylines(keylines, unadjustedCenter);
    const maskInset = Math.max(0, (large - size) / 2);
    const offscreen = center + size / 2 <= 0 || center - size / 2 >= viewport;
    placements.push({ size, center, maskInset, offscreen });
  }
  return placements;
}
