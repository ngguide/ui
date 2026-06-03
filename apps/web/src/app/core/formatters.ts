/**
 * Deterministic, SSR-safe display formatters. They use only explicit `Date`
 * getters and pure string math — no `Date.now()`, no `Math.random()`, no
 * argless `new Date()`, no `Intl`/locale lookups — so server and client renders
 * are identical and the demo reads the same regardless of the host locale.
 */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MS_PER_DAY = 86_400_000;

/** Insert thousands separators into a non-negative integer string. */
function group(intDigits: string): string {
  return intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** `1234.5` → `"$1,234.50"`; negatives keep a leading minus. */
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '-' : '';
  const [intPart, fracPart] = Math.abs(value).toFixed(2).split('.');
  return `${sign}$${group(intPart)}.${fracPart}`;
}

/** `1234` → `"1,234"`; preserves any fractional digits as written. */
export function formatNumber(value: number): string {
  const sign = value < 0 ? '-' : '';
  const [intPart, fracPart] = String(Math.abs(value)).split('.');
  const grouped = group(intPart);
  return `${sign}${fracPart ? `${grouped}.${fracPart}` : grouped}`;
}

/** `12.5` → `"12.5%"`; trims a trailing `.0`. */
export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

/** A signed percent label for deltas: `12.5` → `"+12.5%"`, `-3` → `"−3%"`. */
export function formatDelta(value: number): string {
  if (value === 0) return '0%';
  const sign = value > 0 ? '+' : '−';
  return `${sign}${formatPercent(Math.abs(value))}`;
}

/** `new Date(2026, 5, 4)` → `"Jun 4, 2026"`. */
export function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * A coarse, day-granular relative label of `from` as seen from `to`
 * (pass {@link DEMO_TODAY} as `to`). Compared at calendar-day resolution via
 * `Date.UTC` so it is immune to DST and time-of-day.
 */
export function formatRelative(from: Date, to: Date): string {
  const fromDay = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toDay = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  const days = Math.round((toDay - fromDay) / MS_PER_DAY);

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days === -1) return 'tomorrow';
  if (days > 1) {
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }
  const ahead = -days;
  if (ahead < 7) return `in ${ahead}d`;
  if (ahead < 30) return `in ${Math.floor(ahead / 7)}w`;
  return `in ${Math.floor(ahead / 30)}mo`;
}

/** `"Ada Lovelace"` → `"AL"`; single word → its first letter. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}
