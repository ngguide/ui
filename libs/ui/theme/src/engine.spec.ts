import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generateScheme } from './engine';

/** Parse the unique `--md-sys-color-<token>` names from the committed contract. */
function contractRoleNames(): Set<string> {
  const here = dirname(fileURLToPath(import.meta.url));
  const cssPath = join(here, '../../src/styles/tokens/_color.generated.css');
  const css = readFileSync(cssPath, 'utf8');
  const names = new Set<string>();
  for (const m of css.matchAll(/--md-sys-color-([a-z0-9-]+):/g)) {
    names.add(m[1]);
  }
  return names;
}

describe('generateScheme', () => {
  it('produces exactly the core role names in the static contract (Req 11.3)', () => {
    const generated = new Set(Object.keys(generateScheme({ sourceColor: '#6750A4' }).standard));
    const contract = contractRoleNames();
    expect(generated).toEqual(contract);
  });

  it('matches the static baseline for #6750A4 / tonal-spot / standard (Req 1.4)', () => {
    const s = generateScheme({ sourceColor: '#6750A4' }).standard;
    expect(s['primary'].light).toBe('#65558f');
    expect(s['primary'].dark).toBe('#cfbdfe');
  });

  it('varies output by variant (Req 2.3)', () => {
    const tonal = generateScheme({ sourceColor: '#6750A4', variant: 'tonal-spot' }).standard;
    const vibrant = generateScheme({ sourceColor: '#6750A4', variant: 'vibrant' }).standard;
    expect(vibrant['primary'].light).not.toBe(tonal['primary'].light);
  });

  it('varies output by contrast level (Req 3.3)', () => {
    const s = generateScheme({ sourceColor: '#6750A4' });
    expect(JSON.stringify(s.standard)).not.toBe(JSON.stringify(s.high));
  });

  it('emits 4 contrast-aware roles per custom color, harmonized by default (Req 5)', () => {
    const harmonized = generateScheme({
      sourceColor: '#6750A4',
      customColors: [{ name: 'brand', value: '#00FF00' }],
    }).standard;

    expect(harmonized['brand']).toBeTruthy();
    expect(harmonized['on-brand']).toBeTruthy();
    expect(harmonized['brand-container']).toBeTruthy();
    expect(harmonized['on-brand-container']).toBeTruthy();

    const raw = generateScheme({
      sourceColor: '#6750A4',
      customColors: [{ name: 'brand', value: '#00FF00', harmonize: false }],
    }).standard;

    // Harmonization rotates the hue toward the source → a different value.
    expect(harmonized['brand'].light).not.toBe(raw['brand'].light);
  });
});
