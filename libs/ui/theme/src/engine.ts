/**
 * Pure, DOM-free M3 scheme generation (Decision 1A).
 *
 * Reproduces the build-time generator's role enumeration
 * (`tooling/generate-color-tokens.mts`) so the runtime output matches the
 * static `_color.generated.css` token contract by construction (Req 11). For a
 * `tonal-spot` scheme this produces values identical to `SchemeTonalSpot`,
 * because `new DynamicScheme({ variant: TONAL_SPOT, … })` resolves the same
 * palettes (same default platform `'phone'` + specVersion `'2021'`).
 */
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  DynamicScheme,
  Variant,
  MaterialDynamicColors,
  type DynamicColor,
} from '@material/material-color-utilities';
import type { M3ThemeConfig, M3Contrast, M3SchemeVariant } from './types';

const VARIANT_MAP: Record<M3SchemeVariant, Variant> = {
  monochrome: Variant.MONOCHROME,
  neutral: Variant.NEUTRAL,
  'tonal-spot': Variant.TONAL_SPOT,
  vibrant: Variant.VIBRANT,
  expressive: Variant.EXPRESSIVE,
  fidelity: Variant.FIDELITY,
  content: Variant.CONTENT,
  rainbow: Variant.RAINBOW,
  'fruit-salad': Variant.FRUIT_SALAD,
};

const CONTRAST_MAP: Record<M3Contrast, number> = {
  standard: 0,
  medium: 0.5,
  high: 1,
};

const CONTRAST_LEVELS: M3Contrast[] = ['standard', 'medium', 'high'];

/**
 * `*PaletteKeyColor` roles are internal to the dynamic-color algorithm and are
 * NOT part of the published `--md-sys-color-*` contract — excluding them keeps
 * the runtime role set equal to the static contract (Req 11.2).
 */
const EXCLUDED_ROLE_SUFFIX = 'PaletteKeyColor';

/** kebab-case fragment, e.g. `"on-primary"` — identical to the build-time generator. */
export function camelToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** A single M3 role: its token-name fragment and the MCU `DynamicColor` resolver. */
export interface CoreRole {
  /** kebab-case token fragment, e.g. `"on-primary"`, `"surface-container-low"`. */
  token: string;
  dynamicColor: DynamicColor;
}

/**
 * Enumerate every M3 role exposed by `MaterialDynamicColors`, excluding
 * `*PaletteKeyColor`. Same enumeration as `tooling/generate-color-tokens.mts`,
 * so the role-name set matches the committed token contract (Req 11).
 */
export function coreRoles(): CoreRole[] {
  const mdc = MaterialDynamicColors as unknown as Record<string, unknown>;
  return Object.keys(mdc)
    .filter((key) => !key.endsWith(EXCLUDED_ROLE_SUFFIX))
    .map((key) => ({ key, value: mdc[key] }))
    .filter(
      (entry): entry is { key: string; value: DynamicColor } =>
        entry.value != null &&
        typeof (entry.value as DynamicColor).getArgb === 'function',
    )
    .map(({ key, value }) => ({ token: camelToKebab(key), dynamicColor: value }))
    .sort((a, b) => a.token.localeCompare(b.token));
}

/** Per-role light/dark hex pair. */
export interface RolePair {
  light: string;
  dark: string;
}

/** role(token) -> {light,dark} for one contrast level. */
export type ScopeRoles = Record<string, RolePair>;

/** Full computed scheme: per contrast level, all core + custom roles. */
export interface GeneratedScheme {
  standard: ScopeRoles;
  medium: ScopeRoles;
  high: ScopeRoles;
}

/** Build one MCU `DynamicScheme` (default platform `'phone'`, spec `'2021'`). */
function buildScheme(
  sourceArgb: number,
  variant: M3SchemeVariant,
  contrast: M3Contrast,
  isDark: boolean,
): DynamicScheme {
  return new DynamicScheme({
    sourceColorHct: Hct.fromInt(sourceArgb),
    variant: VARIANT_MAP[variant],
    contrastLevel: CONTRAST_MAP[contrast],
    isDark,
  });
}

/** All core roles for one contrast level, as light/dark pairs. */
function coreScopeRoles(
  sourceArgb: number,
  variant: M3SchemeVariant,
  contrast: M3Contrast,
): ScopeRoles {
  const light = buildScheme(sourceArgb, variant, contrast, false);
  const dark = buildScheme(sourceArgb, variant, contrast, true);
  const out: ScopeRoles = {};
  for (const { token, dynamicColor } of coreRoles()) {
    out[token] = {
      light: hexFromArgb(dynamicColor.getArgb(light)),
      dark: hexFromArgb(dynamicColor.getArgb(dark)),
    };
  }
  return out;
}

/**
 * Pure generation: seed (+ custom colors) → all roles for all 3 contrasts,
 * light + dark. Assumes `config.sourceColor` / custom values are already valid
 * hex (validation lives in `validate.ts` and runs before this in the service).
 */
export function generateScheme(config: M3ThemeConfig): GeneratedScheme {
  const variant = config.variant ?? 'tonal-spot';
  const sourceArgb = argbFromHex(config.sourceColor);

  const scheme = {} as GeneratedScheme;
  for (const contrast of CONTRAST_LEVELS) {
    scheme[contrast] = coreScopeRoles(sourceArgb, variant, contrast);
  }
  return scheme;
}
