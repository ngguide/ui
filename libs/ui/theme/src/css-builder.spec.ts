import { generateScheme } from './engine';
import { buildCss } from './css-builder';

const scheme = generateScheme({ sourceColor: '#6750A4' });

describe('buildCss', () => {
  it('emits light-dark() pairs, color-scheme, and 3 [data-contrast] scopes (Req 4, 6)', () => {
    const css = buildCss(scheme, 'auto');
    expect(css).toContain('light-dark(');
    expect(css).toContain('color-scheme:');
    expect(css).toContain("[data-contrast='standard']");
    expect(css).toContain("[data-contrast='medium']");
    expect(css).toContain("[data-contrast='high']");
    expect(css).toContain('--md-sys-color-primary: light-dark(#65558f, #cfbdfe);');
  });

  it("uses 'light dark' for 'auto' and forces a single side otherwise (Req 4.2, 4.3)", () => {
    expect(buildCss(scheme, 'auto')).toContain('color-scheme: light dark;');
    expect(buildCss(scheme, 'light')).toContain('color-scheme: light;');
    expect(buildCss(scheme, 'light')).not.toContain('color-scheme: light dark;');
    expect(buildCss(scheme, 'dark')).toContain('color-scheme: dark;');
  });
});
