import {
  addDays,
  addMonths,
  buildMonthGrid,
  isSameDay,
} from './date-utils';

describe('date-utils', () => {
  describe('buildMonthGrid', () => {
    it('always returns exactly 42 cells', () => {
      const grid = buildMonthGrid(2026, 5, 0);
      expect(grid).toHaveLength(42);
    });

    it("first cell's weekday equals firstDayOfWeek", () => {
      for (const fdow of [0, 1, 6]) {
        const grid = buildMonthGrid(2026, 5, fdow);
        expect(grid[0].date.getDay()).toBe(fdow);
      }
    });

    it('marks leading/trailing days as not in the current month', () => {
      const grid = buildMonthGrid(2026, 5, 0);
      expect(grid.some((c) => !c.inCurrentMonth)).toBe(true);
      expect(grid.some((c) => c.inCurrentMonth)).toBe(true);
    });
  });

  describe('addMonths', () => {
    it('clamps Jan 31 + 1 month to the last day of February', () => {
      const result = addMonths(new Date(2026, 0, 31), 1);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(28); // 2026 is not a leap year
    });
  });

  describe('addDays', () => {
    it('stays on the same wall-clock day across the US spring-forward DST boundary', () => {
      const before = new Date(2026, 2, 7); // 2026-03-07
      const result = addDays(before, 1);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(8); // 2026-03-08
      expect(isSameDay(result, new Date(2026, 2, 8))).toBe(true);
    });
  });
});
