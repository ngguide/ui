import { firstDayOfWeek, monthNames, weekdayNames } from './intl';

describe('intl', () => {
  it('monthNames returns 12 entries, January first', () => {
    const names = monthNames('en-US');
    expect(names).toHaveLength(12);
    expect(names[0]).toBe('January');
  });

  it('weekdayNames returns 7 entries, Sunday first', () => {
    const names = weekdayNames('en-US');
    expect(names).toHaveLength(7);
    expect(names[0]).toBe('Sunday');
  });

  it('firstDayOfWeek is Sunday(0) for en-US and Monday(1) for en-GB', () => {
    const us = firstDayOfWeek('en-US');
    const gb = firstDayOfWeek('en-GB');
    // Environment-fragile (depends on Intl.getWeekInfo / fallback map),
    // so also guard the range.
    expect(us).toBeGreaterThanOrEqual(0);
    expect(us).toBeLessThanOrEqual(6);
    expect(gb).toBeGreaterThanOrEqual(0);
    expect(gb).toBeLessThanOrEqual(6);
    expect(us).toBe(0);
    expect(gb).toBe(1);
  });
});
