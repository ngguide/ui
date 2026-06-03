import { GuiTime } from './models';

/**
 * Thin Intl wrappers — these only FORMAT, never parse.
 */

export function monthNames(
  locale: string,
  style: 'long' | 'short' = 'long',
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { month: style });
  const names: string[] = [];
  for (let m = 0; m < 12; m++) {
    // Day 15 avoids any TZ/DST edge effects on the month label.
    names.push(fmt.format(new Date(2026, m, 15)));
  }
  return names;
}

export function weekdayNames(
  locale: string,
  style: 'long' | 'short' | 'narrow' = 'long',
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: style });
  const names: string[] = [];
  // 2026-02-01 is a Sunday; iterate the week Sunday-first.
  for (let i = 0; i < 7; i++) {
    names.push(fmt.format(new Date(2026, 1, 1 + i)));
  }
  return names;
}

export function formatDate(
  d: Date,
  locale: string,
  opts?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export function formatTime(t: GuiTime, locale: string, hour12: boolean): string {
  const d = new Date(2026, 0, 1, t.hours, t.minutes, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  }).format(d);
}

const FIRST_DAY_FALLBACK: Record<string, number> = {
  'en-US': 0,
  'en-CA': 0,
  ja: 0,
  he: 0,
  'en-GB': 1,
  ru: 1,
  de: 1,
  fr: 1,
};

/** Return 0..6 (0=Sun). */
export function firstDayOfWeek(locale: string): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay?: number };
      weekInfo?: { firstDay?: number };
    };

    let info: { firstDay?: number } | undefined;
    if (typeof loc.getWeekInfo === 'function') {
      info = loc.getWeekInfo();
    } else if (loc.weekInfo) {
      info = loc.weekInfo;
    }

    if (info && typeof info.firstDay === 'number') {
      // firstDay is 1=Mon..7=Sun; normalize to 0..6 (7→0).
      return info.firstDay % 7;
    }
  } catch {
    // getWeekInfo is not Baseline — fall through to the static map.
  }

  if (locale in FIRST_DAY_FALLBACK) {
    return FIRST_DAY_FALLBACK[locale];
  }
  const language = locale.split('-')[0];
  if (language in FIRST_DAY_FALLBACK) {
    return FIRST_DAY_FALLBACK[language];
  }
  return 0;
}

export function prefersHour12(locale: string): boolean {
  return (
    new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
      .hour12 ?? true
  );
}
