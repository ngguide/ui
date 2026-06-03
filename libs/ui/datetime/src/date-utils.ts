/**
 * Pure date helpers operating at LOCAL MIDNIGHT to avoid TZ/DST off-by-one.
 * No implicit "now": callers always pass dates in.
 */

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(d: Date, n: number): Date {
  const start = startOfDay(d);
  start.setDate(start.getDate() + n);
  return start;
}

export function daysInMonth(year: number, month0: number): number {
  // Day 0 of the next month is the last day of the target month.
  return new Date(year, month0 + 1, 0).getDate();
}

export function addMonths(d: Date, n: number): Date {
  const start = startOfDay(d);
  const year = start.getFullYear();
  const month0 = start.getMonth();
  const day = start.getDate();

  const targetMonthIndex = month0 + n;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth0 = ((targetMonthIndex % 12) + 12) % 12;

  const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth0));
  return new Date(targetYear, targetMonth0, clampedDay, 0, 0, 0, 0);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function compareDate(a: Date, b: Date): number {
  const sa = startOfDay(a).getTime();
  const sb = startOfDay(b).getTime();
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
}

export function isBefore(a: Date, b: Date): boolean {
  return compareDate(a, b) < 0;
}

export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  let result = startOfDay(d);
  if (min && compareDate(result, min) < 0) {
    result = startOfDay(min);
  }
  if (max && compareDate(result, max) > 0) {
    result = startOfDay(max);
  }
  return result;
}

export interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

/**
 * Build a fixed 6×7 = 42-cell month grid.
 * The first cell is the start-of-week (per firstDayOfWeek, 0=Sun..6=Sat) on or
 * before the 1st of the month. Leading/trailing days from adjacent months have
 * inCurrentMonth === false.
 */
export function buildMonthGrid(
  year: number,
  month0: number,
  firstDayOfWeek: number,
): CalendarCell[] {
  const first = new Date(year, month0, 1, 0, 0, 0, 0);
  const firstWeekday = first.getDay(); // 0=Sun..6=Sat
  const offset = ((firstWeekday - firstDayOfWeek) % 7 + 7) % 7;
  const gridStart = addDays(first, -offset);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    cells.push({
      date,
      inCurrentMonth: date.getMonth() === month0 && date.getFullYear() === year,
    });
  }
  return cells;
}
