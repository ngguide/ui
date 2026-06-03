import { GuiTime } from './models';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function makeLocalDate(year: number, month1: number, day: number): Date | null {
  const d = new Date(year, month1 - 1, day, 0, 0, 0, 0);
  // Reject overflow (e.g. 2026-02-31 rolls into March).
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month1 - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

export function parseDate(input: string, locale: string): Date | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  if (ISO_DATE.test(trimmed)) {
    const [y, m, d] = trimmed.split('-').map(Number);
    return makeLocalDate(y, m, d);
  }

  // Derive the locale's field order from a reference date.
  const reference = new Date(2026, 0, 2);
  const parts = new Intl.DateTimeFormat(locale).formatToParts(reference);
  const order = parts
    .filter(
      (p) => p.type === 'year' || p.type === 'month' || p.type === 'day',
    )
    .map((p) => p.type);

  if (order.length !== 3) return null;

  const numbers = trimmed
    .split(/\D+/)
    .filter((s) => s !== '')
    .map(Number);
  if (numbers.length !== 3 || numbers.some((n) => Number.isNaN(n))) {
    return null;
  }

  let year: number | undefined;
  let month1: number | undefined;
  let day: number | undefined;
  order.forEach((type, i) => {
    if (type === 'year') year = numbers[i];
    else if (type === 'month') month1 = numbers[i];
    else day = numbers[i];
  });

  if (year === undefined || month1 === undefined || day === undefined) {
    return null;
  }

  return makeLocalDate(year, month1, day);
}

const TIME = /^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?$/i;

export function parseTime(input: string, hour12: boolean): GuiTime | null {
  const trimmed = input.trim();
  const match = TIME.exec(trimmed);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase().replace(/\./g, '');

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (hour12 || meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'pm') {
      hours = hours === 12 ? 12 : hours + 12;
    } else if (meridiem === 'am') {
      hours = hours === 12 ? 0 : hours;
    }
  } else {
    if (hours < 0 || hours > 23) return null;
  }

  return { hours, minutes };
}
