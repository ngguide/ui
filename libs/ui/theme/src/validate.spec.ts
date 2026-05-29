import { parseHex, validateConfig } from './validate';

describe('parseHex', () => {
  it('normalizes shorthand and casing to the same ARGB', () => {
    expect(parseHex('#ABC', 'x')).toBe(parseHex('#aabbcc', 'x'));
  });

  it('drops alpha from #RRGGBBAA', () => {
    expect(parseHex('#6750A4FF', 'x')).toBe(parseHex('#6750A4', 'x'));
  });

  it("throws naming the label for unparseable input (Req 9)", () => {
    expect(() => parseHex('nope', 'sourceColor')).toThrow(/invalid sourceColor 'nope'/);
  });
});

describe('validateConfig', () => {
  it('accepts a valid config (incl. shorthand) without throwing', () => {
    expect(() => validateConfig({ sourceColor: '#6750A4' })).not.toThrow();
    expect(() => validateConfig({ sourceColor: '#abc' })).not.toThrow();
  });

  it('throws naming the offending sourceColor (Req 9.1)', () => {
    expect(() => validateConfig({ sourceColor: '#zzz' })).toThrow(/sourceColor/);
  });

  it('throws naming the offending custom color (Req 9.2)', () => {
    expect(() =>
      validateConfig({
        sourceColor: '#6750A4',
        customColors: [{ name: 'brand', value: 'nope' }],
      }),
    ).toThrow(/brand/);
  });

  it('rejects a custom name whose derived role collides with a core role (Req 5.5)', () => {
    expect(() =>
      validateConfig({
        sourceColor: '#6750A4',
        customColors: [{ name: 'primary', value: '#00FF00' }],
      }),
    ).toThrow(/collides/);

    // 'surface' would derive 'on-surface', which is a core role.
    expect(() =>
      validateConfig({
        sourceColor: '#6750A4',
        customColors: [{ name: 'surface', value: '#00FF00' }],
      }),
    ).toThrow(/collides/);
  });
});
