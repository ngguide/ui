import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { M3Mode, M3ThemeService } from '@ngguide/ui/theme';
import { BASE_THEME, BRAND_SEEDS, DEFAULT_SEED } from '../core/theme-config';

/**
 * Runtime theme controls for the demo (R7). Root-provided so the chosen mode
 * and brand seed survive route changes within a session; a page reload re-runs
 * the app config's `provideM3Theme`, resetting to defaults (R7.3).
 *
 * Every change funnels through `M3ThemeService.setTheme`, which updates a single
 * managed `<style data-m3-dynamic>` — SSR-safe, no unstyled flash (R7.4).
 */
@Injectable({ providedIn: 'root' })
export class ThemeController {
  private readonly theme = inject(M3ThemeService);

  readonly mode = signal<M3Mode>('auto');
  readonly seed = signal<string>(DEFAULT_SEED);
  readonly seeds = BRAND_SEEDS;

  /**
   * Whether the OS prefers a dark scheme. SSR-safe: `false` on the server (no
   * `matchMedia`), resolved + kept live on the client so `auto` mode reflects
   * the real appearance.
   */
  private readonly systemDark = signal(false);

  /**
   * Effective dark state for binding the app-bar `gui-switch`: explicit `dark`,
   * or `auto` resolving to dark via the OS preference. Keeps the toggle in sync
   * with what the user actually sees (instead of only an explicit `dark` choice).
   */
  readonly isDark = computed(
    () => this.mode() === 'dark' || (this.mode() === 'auto' && this.systemDark()),
  );

  constructor() {
    if (
      isPlatformBrowser(inject(PLATFORM_ID)) &&
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
    ) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(mq.matches);
      mq.addEventListener('change', (e) => this.systemDark.set(e.matches));
    }
  }

  setMode(mode: M3Mode): void {
    this.mode.set(mode);
    this.apply();
  }

  /** Toggle the effective scheme: flips to an explicit `light`/`dark`. */
  toggleDark(): void {
    this.setMode(this.isDark() ? 'light' : 'dark');
  }

  setSeed(seed: string): void {
    this.seed.set(seed);
    this.apply();
  }

  private apply(): void {
    this.theme.setTheme({
      ...BASE_THEME,
      sourceColor: this.seed(),
      mode: this.mode(),
    });
  }
}
