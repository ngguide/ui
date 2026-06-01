/**
 * Serialize a `GeneratedScheme` to CSS text identical in shape to the static
 * `_color.generated.css` (Decision 3A): `light-dark()` pairs under
 * `[data-contrast]` scopes, with `color-scheme` on `:root`. Because the shape
 * matches the baseline, OS light/dark auto-switch and the `[data-contrast]`
 * scopes keep working unchanged (Req 4, Req 6).
 */
import type { GeneratedScheme, ScopeRoles } from './engine';
import type { M3Mode } from './types';

/** `'auto'` → `"light dark"` (OS decides); `'light'`/`'dark'` force one side. */
function colorScheme(mode: M3Mode): string {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return 'light dark';
}

function emitScope(
  selector: string,
  roles: ScopeRoles,
  withColorScheme: boolean,
  mode: M3Mode,
): string {
  const lines: string[] = [`${selector} {`];
  if (withColorScheme) {
    lines.push(`  color-scheme: ${colorScheme(mode)};`);
  }
  for (const [token, pair] of Object.entries(roles)) {
    lines.push(`  --md-sys-color-${token}: light-dark(${pair.light}, ${pair.dark});`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Build the full CSS for a generated scheme. `mode` controls only the `:root`
 * `color-scheme`; `light-dark()` then resolves to the forced side when a mode
 * is forced (Req 4.3), or follows the OS for `'auto'` (Req 4.2).
 */
export function buildCss(scheme: GeneratedScheme, mode: M3Mode): string {
  const blocks = [
    emitScope(":root,\n[data-contrast='standard']", scheme.standard, true, mode),
    emitScope("[data-contrast='medium']", scheme.medium, false, mode),
    emitScope("[data-contrast='high']", scheme.high, false, mode),
  ];
  return blocks.join('\n\n') + '\n';
}
