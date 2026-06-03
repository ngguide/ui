import type { M3ThemeConfig } from '@ngguide/ui/theme';

/**
 * Fixed parts of the M3 theme config shared by every runtime re-theme. The
 * `sourceColor` (brand seed) and `mode` (light/dark) are supplied at call time
 * by {@link ThemeController}; everything else stays constant so the dynamic
 * color system is exercised without drifting from the M3 contract.
 */
export const BASE_THEME: Omit<M3ThemeConfig, 'sourceColor' | 'mode'> = {
  variant: 'tonal-spot',
  contrast: 'standard',
  customColors: [
    { name: 'brand-success', value: '#2e7d32' },
    { name: 'brand-warning', value: '#f9a825' },
  ],
};

export interface BrandSeed {
  name: string;
  value: string;
}

/** Brand seeds selectable at runtime to regenerate the whole scheme (R7.2). */
export const BRAND_SEEDS: readonly BrandSeed[] = [
  { name: 'Indigo', value: '#6750A4' },
  { name: 'Ocean', value: '#00629D' },
  { name: 'Crimson', value: '#B3261E' },
  { name: 'Forest', value: '#386A20' },
  { name: 'Amber', value: '#7D5700' },
];

export const DEFAULT_SEED = BRAND_SEEDS[0].value;
