import { Injectable, computed, inject, signal } from '@angular/core';
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

  /** Convenience flag for binding a dark `gui-switch`. */
  readonly isDark = computed(() => this.mode() === 'dark');

  setMode(mode: M3Mode): void {
    this.mode.set(mode);
    this.apply();
  }

  toggleDark(): void {
    this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
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
