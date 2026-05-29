/**
 * Fail-fast validation for M3 dynamic-color config (Req 9). No silent
 * fallbacks: an unparseable color or a colliding custom name throws a
 * descriptive error naming the offender.
 */
import { argbFromHex } from '@material/material-color-utilities';
import type { M3ThemeConfig } from './types';
import { coreRoles } from './engine';

const HEX3 = /^#?([0-9a-fA-F]{3})$/;
const HEX6 = /^#?([0-9a-fA-F]{6})$/;
const HEX8 = /^#?([0-9a-fA-F]{8})$/;

/**
 * Parse a hex color to ARGB. Accepts `#RGB`, `#RRGGBB`, and `#RRGGBBAA`
 * (alpha dropped); the leading `#` is optional and casing is ignored. Throws a
 * descriptive `Error` (using `label`) for anything else — never a fallback.
 */
export function parseHex(input: string, label: string): number {
  const fail = (): never => {
    throw new Error(`M3 dynamic color: invalid ${label} '${input}'`);
  };

  if (typeof input !== 'string') {
    fail();
  }
  const value = input.trim();

  let rrggbb: string | null = null;
  let m: RegExpMatchArray | null;
  if ((m = value.match(HEX6))) {
    rrggbb = m[1];
  } else if ((m = value.match(HEX3))) {
    const [r, g, b] = m[1].split('');
    rrggbb = `${r}${r}${g}${g}${b}${b}`;
  } else if ((m = value.match(HEX8))) {
    // #RRGGBBAA — keep RGB, drop alpha (scheme generation is alpha-agnostic).
    rrggbb = m[1].slice(0, 6);
  } else {
    fail();
  }

  return argbFromHex(`#${rrggbb}`);
}

/**
 * Validate `sourceColor` and every `customColors[].value`, and reject custom
 * names whose derived roles collide with a core `--md-sys-color-` role
 * (protects Req 5.5). Throws on the first problem, naming it.
 */
export function validateConfig(config: M3ThemeConfig): void {
  if (config == null || typeof config.sourceColor !== 'string') {
    throw new Error("M3 dynamic color: config.sourceColor is required");
  }

  parseHex(config.sourceColor, 'sourceColor');

  const customColors = config.customColors ?? [];
  if (customColors.length === 0) {
    return;
  }

  const coreTokens = new Set(coreRoles().map((role) => role.token));

  for (const custom of customColors) {
    if (!custom.name || typeof custom.name !== 'string') {
      throw new Error('M3 dynamic color: every custom color must have a non-empty name');
    }

    parseHex(custom.value, `custom color "${custom.name}" value`);

    // Each custom color contributes four derived role names; none may overwrite
    // a core contract role (e.g. a custom named "surface" → "on-surface").
    const derived = [
      custom.name,
      `on-${custom.name}`,
      `${custom.name}-container`,
      `on-${custom.name}-container`,
    ];
    for (const token of derived) {
      if (coreTokens.has(token)) {
        throw new Error(
          `M3 dynamic color: custom color "${custom.name}" produces role ` +
            `"--md-sys-color-${token}" that collides with a core role`,
        );
      }
    }
  }
}
