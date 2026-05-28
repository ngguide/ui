import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(
  join(here, '../src/styles/tokens/_color.generated.css'),
  'utf8',
);

describe('generated color tokens', () => {
  it('defines all three contrast scopes', () => {
    expect(css).toContain("[data-contrast='standard']");
    expect(css).toContain("[data-contrast='medium']");
    expect(css).toContain("[data-contrast='high']");
  });

  it('uses light-dark() for color roles and sets color-scheme', () => {
    expect(css).toContain('color-scheme: light dark');
    expect(css).toMatch(/--md-sys-color-primary:\s*light-dark\(/);
  });

  it('provides forced-mode color-scheme overrides', () => {
    expect(css).toContain("[data-theme='light']");
    expect(css).toContain("[data-theme='dark']");
  });

  it('preserves every token name the shipped components rely on (Req 12)', () => {
    const required = [
      '--md-sys-color-primary',
      '--md-sys-color-on-primary',
      '--md-sys-color-secondary',
      '--md-sys-color-on-secondary',
      '--md-sys-color-secondary-container',
      '--md-sys-color-on-secondary-container',
      '--md-sys-color-tertiary',
      '--md-sys-color-on-tertiary',
      '--md-sys-color-primary-container',
      '--md-sys-color-on-primary-container',
      '--md-sys-color-on-surface',
      '--md-sys-color-on-surface-variant',
      '--md-sys-color-surface-container-low',
      '--md-sys-color-outline-variant',
      '--md-sys-color-shadow',
    ];
    for (const token of required) {
      expect(css).toContain(token);
    }
  });
});
