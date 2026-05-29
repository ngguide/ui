import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { M3ThemeService } from './theme.service';
import { provideM3Theme } from './provide-theme';

function dynamicStyles(doc: Document): HTMLStyleElement[] {
  return Array.from(doc.head.querySelectorAll('style[data-m3-dynamic]'));
}

describe('M3ThemeService (TestBed + DOCUMENT)', () => {
  let doc: Document;

  afterEach(() => {
    // Clean DOM between tests — the jsdom document persists across specs.
    for (const el of dynamicStyles(doc ?? document)) {
      el.remove();
    }
  });

  it('injects a <style> at the end of <head> on setTheme (Req 6)', () => {
    const svc = TestBed.inject(M3ThemeService);
    doc = TestBed.inject(DOCUMENT);

    svc.setTheme({ sourceColor: '#6750A4' });

    const styles = dynamicStyles(doc);
    expect(styles.length).toBe(1);
    expect(styles[0]).toBe(doc.head.lastElementChild);
    expect(styles[0].textContent).toContain('--md-sys-color-primary: light-dark(#65558f, #cfbdfe);');
  });

  it('reuses the single <style> and replaces its text on re-apply (Req 6.3)', () => {
    const svc = TestBed.inject(M3ThemeService);
    doc = TestBed.inject(DOCUMENT);

    svc.setTheme({ sourceColor: '#6750A4' });
    const first = dynamicStyles(doc)[0].textContent;
    svc.setTheme({ sourceColor: '#00629D', variant: 'vibrant' });

    const styles = dynamicStyles(doc);
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).not.toBe(first);
  });

  it('resolve() returns role→hex equal to the applied values (Req 8)', () => {
    const svc = TestBed.inject(M3ThemeService);
    doc = TestBed.inject(DOCUMENT);

    svc.setTheme({ sourceColor: '#6750A4' });
    const roles = svc.resolve({ mode: 'light', contrast: 'standard' });

    expect(roles['primary']).toBe('#65558f');
    // The applied CSS carries this exact light value.
    expect(dynamicStyles(doc)[0].textContent).toContain(`light-dark(${roles['primary']},`);
  });

  it('setTheme fails fast on invalid input (Req 9)', () => {
    const svc = TestBed.inject(M3ThemeService);
    doc = TestBed.inject(DOCUMENT);
    expect(() => svc.setTheme({ sourceColor: '#zzz' })).toThrow(/sourceColor/);
  });
});

describe('provideM3Theme', () => {
  it('applies the configured scheme at bootstrap (Req 7.2)', () => {
    TestBed.configureTestingModule({
      providers: [provideM3Theme({ sourceColor: '#6750A4', variant: 'tonal-spot' })],
    });

    const svc = TestBed.inject(M3ThemeService);
    const doc = TestBed.inject(DOCUMENT);

    expect(svc.config()?.sourceColor).toBe('#6750A4');
    const styles = Array.from(doc.head.querySelectorAll('style[data-m3-dynamic]'));
    expect(styles.length).toBeGreaterThanOrEqual(1);
    expect(styles.at(-1)?.textContent).toContain('--md-sys-color-primary: light-dark(#65558f, #cfbdfe);');

    for (const el of styles) el.remove();
  });
});
