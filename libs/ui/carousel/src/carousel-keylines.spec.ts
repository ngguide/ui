import {
  buildStrategy,
  placeItems,
  MAX_SMALL_ITEM,
  MIN_SMALL_ITEM,
  ArrangeOptions,
} from './carousel-keylines';

const OPTS = (over: Partial<ArrangeOptions> = {}): ArrangeOptions => ({
  preferredLargeWidth: 186,
  itemSpacing: 8,
  itemCount: 8,
  alignment: 'start',
  leadingPadding: 16,
  trailingPadding: 16,
  ...over,
});

describe('buildStrategy', () => {
  it('returns an empty strategy for zero width or no items', () => {
    expect(buildStrategy('multi-browse', 0, OPTS()).snapOffsets.length).toBe(0);
    expect(
      buildStrategy('multi-browse', 1000, OPTS({ itemCount: 0 })).snapOffsets
        .length,
    ).toBe(0);
  });

  describe('multi-browse', () => {
    it('packs multiple large items plus a small keyline (40-56dp) (Req 11.2/11.3)', () => {
      const s = buildStrategy('multi-browse', 1022, OPTS());
      const focal = s.keylines.keylines.filter((k) => k.isFocal);
      // A wide viewport shows more than one large item ("at least one large").
      expect(focal.length).toBeGreaterThan(1);
      expect(focal.every((k) => Math.round(k.size) === 186)).toBe(true);
      // The smallest non-anchor keyline is a small item within the 40-56dp band.
      const small = Math.min(
        ...s.keylines.keylines.filter((k) => !k.isAnchor).map((k) => k.size),
      );
      expect(small).toBeGreaterThanOrEqual(MIN_SMALL_ITEM);
      expect(small).toBeLessThanOrEqual(MAX_SMALL_ITEM);
    });

    it('exposes a snap offset per item and a positive scroll extent', () => {
      const s = buildStrategy('multi-browse', 1022, OPTS());
      expect(s.snapOffsets.length).toBe(8);
      expect(s.maxScrollOffset).toBeGreaterThan(0);
      // The native spacer is exactly long enough to reach maxScrollOffset.
      expect(Math.round(s.contentExtent)).toBe(
        Math.round(s.maxScrollOffset + 1022),
      );
    });
  });

  describe('hero', () => {
    it('uses a dynamic large that fills the viewport beside the peek (Req 11.1)', () => {
      const s = buildStrategy('hero', 1000, OPTS());
      // Hero large is dynamic — much larger than the preferred 186 on a wide box.
      expect(s.large).toBeGreaterThan(186);
      expect(s.large).toBeLessThan(1000);
      // One focal large + a trailing small peek.
      expect(s.keylines.keylines.filter((k) => k.isFocal).length).toBe(1);
    });
  });

  describe('center-aligned hero', () => {
    it('centers a single dynamic large item (Req 11.1)', () => {
      const s = buildStrategy('center-aligned-hero', 1000, OPTS());
      const focal = s.keylines.keylines.filter((k) => k.isFocal);
      expect(focal.length).toBe(1);
      // The focal item's center sits at the viewport midpoint.
      expect(focal[0].offset).toBeCloseTo(500, 0);
    });
  });

  describe('uncontained', () => {
    it('lays out uniform large items (no medium/small taper)', () => {
      const s = buildStrategy('uncontained', 1000, OPTS());
      const p = placeItems(s, 0, 1000);
      const visible = p.filter((it) => !it.offscreen).map((it) => Math.round(it.size));
      // Every visible item is the same (large) width.
      expect(new Set(visible).size).toBe(1);
      expect(visible[0]).toBe(186);
    });
  });
});

describe('placeItems', () => {
  it('renders the first item large at rest and tapers later items (Req 11.3)', () => {
    const s = buildStrategy('multi-browse', 1022, OPTS());
    const p = placeItems(s, 0, 1022);
    expect(Math.round(p[0].size)).toBe(186);
    expect(p[7].size).toBeLessThan(p[0].size);
  });

  it('keeps content within the frame — mask inset in [0, large/2] (parallax, no blank)', () => {
    const s = buildStrategy('multi-browse', 1022, OPTS());
    const p = placeItems(s, 0, 1022);
    for (const it of p) {
      expect(it.maskInset).toBeGreaterThanOrEqual(0);
      expect(it.maskInset).toBeLessThanOrEqual(s.large / 2 + 0.01);
    }
  });

  it('moves the focal window as the user scrolls (the M3 size morph)', () => {
    const s = buildStrategy('multi-browse', 1022, OPTS());
    const at0 = placeItems(s, 0, 1022);
    const atMax = placeItems(s, s.maxScrollOffset, 1022);
    // Later items grow as they scroll into the focal range.
    const tailRest = at0.slice(4).reduce((a, b) => a + b.size, 0);
    const tailMax = atMax.slice(4).reduce((a, b) => a + b.size, 0);
    expect(tailMax).toBeGreaterThan(tailRest);
  });

  it('is safe on an empty strategy (zero-size placements)', () => {
    const s = buildStrategy('multi-browse', 0, OPTS());
    const p = placeItems(s, 0, 0);
    expect(p.every((it) => it.size === 0)).toBe(true);
  });
});
