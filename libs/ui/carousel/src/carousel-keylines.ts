/**
 * Pure M3 carousel keyline sizing engine. No `Date.now`/`Math.random`, no DOM —
 * deterministic and SSR-safe (Req 16.4). The runtime ({@link GuiCarousel})
 * feeds it the measured viewport width and applies the resulting item widths.
 *
 * Verified M3 sizing rules (Compose `CarouselDefaults`): the focal item renders
 * at the preferred large width; the smallest visible items are
 * `small = clamp(large / 3, 40, 56)`; a medium item bridges them at
 * `medium = (large + small) / 2`.
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

/** dp — smallest a small carousel item may shrink to (verified). */
export const MIN_SMALL_ITEM = 40;
/** dp — largest a small carousel item may grow to (verified). */
export const MAX_SMALL_ITEM = 56;

/**
 * Below this focal width the multi-browse layout has no room for small items
 * and drops them, showing only the focal (and a medium if it fits).
 */
const SMALL_DROP_THRESHOLD = 80;

export interface KeylineArrangement {
  /** Focal item width (px). */
  large: number;
  /** Medium item width (px); 0 when the layout has no medium keyline. */
  medium: number;
  /** Small item width (px); 0 when no small items are shown. */
  small: number;
  largeCount: number;
  mediumCount: number;
  smallCount: number;
}

const EMPTY: KeylineArrangement = {
  large: 0,
  medium: 0,
  small: 0,
  largeCount: 0,
  mediumCount: 0,
  smallCount: 0,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** small = clamp(large / 3, 40, 56) — verified M3 rule. */
function smallFor(large: number): number {
  return clamp(large / 3, MIN_SMALL_ITEM, MAX_SMALL_ITEM);
}

export interface ArrangeOptions {
  preferredLargeWidth: number;
  itemSpacing: number;
  itemCount: number;
}

/**
 * Compute the keyline arrangement that fits `viewportWidth` for a layout.
 * Returns a degenerate (all-zero) arrangement when there is nothing to lay out.
 */
export function arrange(
  layout: GuiCarouselLayout,
  viewportWidth: number,
  opts: ArrangeOptions,
): KeylineArrangement {
  const { preferredLargeWidth, itemSpacing, itemCount } = opts;
  if (viewportWidth <= 0 || itemCount <= 0) {
    return { ...EMPTY };
  }

  switch (layout) {
    case 'full-screen':
      // One item fills the viewport (Req 11.1).
      return {
        ...EMPTY,
        large: viewportWidth,
        largeCount: 1,
      };

    case 'hero': {
      // One large focal item plus a small peek of the next (Req 11.1).
      const small = Math.min(smallFor(preferredLargeWidth), viewportWidth);
      const canPeek =
        itemCount > 1 && viewportWidth - small - itemSpacing > small;
      const large = canPeek
        ? viewportWidth - small - itemSpacing
        : viewportWidth;
      return {
        ...EMPTY,
        large: Math.max(0, large),
        small: canPeek ? small : 0,
        largeCount: 1,
        smallCount: canPeek ? 1 : 0,
      };
    }

    case 'center-aligned-hero': {
      // One large focal item centered with a small peek on *each* side
      // (M3 center-aligned hero shows at least one large + two small).
      const small = Math.min(smallFor(preferredLargeWidth), viewportWidth);
      const canPeek =
        itemCount > 1 &&
        viewportWidth - 2 * (small + itemSpacing) > small;
      const large = canPeek
        ? viewportWidth - 2 * (small + itemSpacing)
        : viewportWidth;
      return {
        ...EMPTY,
        large: Math.max(0, large),
        small: canPeek ? small : 0,
        largeCount: 1,
        // Two small peeks (leading + trailing) frame the centered focal item.
        smallCount: canPeek ? 2 : 0,
      };
    }

    case 'uncontained-multi-aspect':
    case 'uncontained': {
      // Repeat the preferred width; the last visible item is cut off (resized).
      const large = Math.min(preferredLargeWidth, viewportWidth);
      const step = large + itemSpacing;
      const fullCount = Math.max(
        1,
        Math.floor((viewportWidth + itemSpacing) / step),
      );
      const used = fullCount * large + (fullCount - 1) * itemSpacing;
      const leftover = viewportWidth - used - itemSpacing;
      const showCut = leftover > MIN_SMALL_ITEM && fullCount < itemCount;
      return {
        ...EMPTY,
        large,
        small: showCut ? leftover : 0,
        largeCount: Math.min(fullCount, itemCount),
        smallCount: showCut ? 1 : 0,
      };
    }

    case 'multi-browse':
    default: {
      // One large focal item, then a medium, then small items — non-focal
      // keylines capped at 2 total; smalls dropped when the focal item is
      // narrower than 80px (Req 11.2).
      const large = Math.min(preferredLargeWidth, viewportWidth);
      const small = smallFor(large);
      const medium = (large + small) / 2;
      let remaining = viewportWidth - large - itemSpacing;
      let mediumCount = 0;
      let smallCount = 0;

      if (large >= SMALL_DROP_THRESHOLD) {
        if (remaining >= medium) {
          mediumCount = 1;
          remaining -= medium + itemSpacing;
        }
        while (smallCount + mediumCount < 2 && remaining >= small) {
          smallCount += 1;
          remaining -= small + itemSpacing;
        }
      }

      // Never lay out more slots than there are items.
      const nonFocalBudget = Math.max(0, itemCount - 1);
      mediumCount = Math.min(mediumCount, nonFocalBudget);
      smallCount = Math.min(smallCount, nonFocalBudget - mediumCount);

      return {
        large,
        medium: mediumCount > 0 ? medium : 0,
        small: smallCount > 0 ? small : 0,
        largeCount: 1,
        mediumCount,
        smallCount,
      };
    }
  }
}

/**
 * Interpolated width and clip inset for the item at `index`, given the current
 * `scrollOffset` (px). Items at the focal keyline render at `large`; items
 * further away taper toward `small`, producing the M3 size-morph as the user
 * scrolls. Pure and deterministic.
 */
export function maskForOffset(
  arrangement: KeylineArrangement,
  scrollOffset: number,
  index: number,
): { width: number; clipInset: number } {
  const { large } = arrangement;
  const smallest = arrangement.small || arrangement.medium || large;
  if (large <= 0) {
    return { width: 0, clipInset: 0 };
  }
  const focalIndex = scrollOffset / large;
  const distance = Math.min(1, Math.abs(index - focalIndex));
  const width = large - distance * (large - smallest);
  const clipInset = (large - width) / 2;
  return { width, clipInset };
}
