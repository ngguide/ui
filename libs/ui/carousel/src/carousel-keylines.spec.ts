import {
  MAX_SMALL_ITEM,
  MIN_SMALL_ITEM,
  arrange,
  maskForOffset,
} from './carousel-keylines';

const OPTS = { preferredLargeWidth: 186, itemSpacing: 8, itemCount: 8 };

describe('arrange', () => {
  it('returns a degenerate arrangement for zero width or no items', () => {
    expect(arrange('multi-browse', 0, OPTS).largeCount).toBe(0);
    expect(
      arrange('multi-browse', 360, { ...OPTS, itemCount: 0 }).largeCount,
    ).toBe(0);
  });

  describe('multi-browse', () => {
    it('keeps small within [40, 56] and medium at the midpoint (Req 11.2)', () => {
      const a = arrange('multi-browse', 412, OPTS);
      expect(a.small).toBeGreaterThanOrEqual(MIN_SMALL_ITEM);
      expect(a.small).toBeLessThanOrEqual(MAX_SMALL_ITEM);
      expect(a.medium).toBeCloseTo((a.large + a.small) / 2, 5);
      expect(a.largeCount).toBe(1);
    });

    it('caps non-focal keylines at two (Req 11.2)', () => {
      const a = arrange('multi-browse', 1200, OPTS);
      expect(a.mediumCount + a.smallCount).toBeLessThanOrEqual(2);
    });

    it('drops small items when the focal width is below 80px (Req 11.2)', () => {
      const a = arrange('multi-browse', 60, {
        ...OPTS,
        preferredLargeWidth: 60,
      });
      expect(a.smallCount).toBe(0);
      expect(a.mediumCount).toBe(0);
    });
  });

  describe('full-screen', () => {
    it('lays out a single item filling the viewport (Req 11.1)', () => {
      const a = arrange('full-screen', 360, OPTS);
      expect(a.large).toBe(360);
      expect(a.largeCount).toBe(1);
      expect(a.smallCount).toBe(0);
    });
  });

  describe('hero', () => {
    it('shows one large focal item and a small peek (Req 11.1)', () => {
      const a = arrange('hero', 360, OPTS);
      expect(a.largeCount).toBe(1);
      expect(a.smallCount).toBe(1);
      expect(a.large + a.small + OPTS.itemSpacing).toBeCloseTo(360, 5);
    });
  });

  describe('uncontained', () => {
    it('fits whole items and resizes the cut-off trailing item (Req 11.3)', () => {
      const a = arrange('uncontained', 420, OPTS);
      expect(a.large).toBe(186);
      expect(a.largeCount).toBeGreaterThanOrEqual(1);
      // A partial item peeks when there is leftover room and more items.
      expect(a.smallCount).toBeLessThanOrEqual(1);
    });
  });
});

describe('maskForOffset', () => {
  it('renders the focal item at large and distant items toward small', () => {
    const a = arrange('multi-browse', 412, OPTS);
    const focal = maskForOffset(a, 0, 0);
    const distant = maskForOffset(a, 0, 5);
    expect(focal.width).toBeCloseTo(a.large, 5);
    expect(distant.width).toBeLessThan(a.large);
    expect(focal.clipInset).toBe(0);
  });

  it('is safe on an empty arrangement', () => {
    expect(maskForOffset(arrange('multi-browse', 0, OPTS), 0, 0)).toEqual({
      width: 0,
      clipInset: 0,
    });
  });
});
