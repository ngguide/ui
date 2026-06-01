/**
 * Public types for @ngguide/ui/theme (M3 dynamic color).
 *
 * These describe the configuration accepted by `provideM3Theme` /
 * `M3ThemeService.setTheme` and the shapes returned by the read API. They carry
 * no behaviour — generation lives in `engine.ts`.
 */

/** M3 scheme variants (map 1:1 to MCU's `Variant` enum). */
export type M3SchemeVariant =
  | 'monochrome'
  | 'neutral'
  | 'tonal-spot'
  | 'vibrant'
  | 'expressive'
  | 'fidelity'
  | 'content'
  | 'rainbow'
  | 'fruit-salad';

/** M3 contrast levels (map to MCU `contrastLevel` 0 / 0.5 / 1). */
export type M3Contrast = 'standard' | 'medium' | 'high';

/** Active-mode policy. `'auto'` follows the OS via `color-scheme` + `light-dark()`. */
export type M3Mode = 'light' | 'dark' | 'auto';

/** A named brand color folded into the scheme as its own role set. */
export interface M3CustomColor {
  /** Identifier used to build role names: `--md-sys-color-<name>`, `-on-<name>`, … */
  name: string;
  /** Source hex for this color. */
  value: string;
  /** Blend the hue toward the source color (M3 harmonize). Default: `true`. */
  harmonize?: boolean;
}

/** Configuration accepted by `provideM3Theme` and `M3ThemeService.setTheme`. */
export interface M3ThemeConfig {
  /** Source/seed hex color. Required. */
  sourceColor: string;
  /** Default: `'tonal-spot'`. */
  variant?: M3SchemeVariant;
  /** Default: `'standard'`. */
  contrast?: M3Contrast;
  /** Default: `'auto'`. */
  mode?: M3Mode;
  /** Optional extended colors. */
  customColors?: M3CustomColor[];
}

/** The four roles of one color family, as hex. */
export interface M3ColorGroup {
  color: string;
  onColor: string;
  colorContainer: string;
  onColorContainer: string;
}

/**
 * Flat role→hex map for one `(mode, contrast)`, including custom roles.
 * Returned by `M3ThemeService.resolve()`. Keys are role names WITHOUT the
 * `--md-sys-color-` prefix (e.g. `'primary'`, `'on-primary'`).
 */
export type M3ResolvedRoles = Record<string, string>;
