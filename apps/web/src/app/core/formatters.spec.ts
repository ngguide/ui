import {
  formatCurrency,
  formatDate,
  formatDelta,
  formatNumber,
  formatPercent,
  formatRelative,
  initials,
} from './formatters';
import { DEMO_TODAY } from './demo-date';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('groups thousands and keeps two decimals', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('keeps a leading minus for negatives', () => {
      expect(formatCurrency(-42.1)).toBe('-$42.10');
    });
  });

  describe('formatNumber', () => {
    it('groups thousands without forcing decimals', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(12345678)).toBe('12,345,678');
    });
  });

  describe('formatPercent / formatDelta', () => {
    it('renders percents and signed deltas', () => {
      expect(formatPercent(12)).toBe('12%');
      expect(formatPercent(12.5)).toBe('12.5%');
      expect(formatDelta(12.5)).toBe('+12.5%');
      expect(formatDelta(-3)).toBe('−3%');
      expect(formatDelta(0)).toBe('0%');
    });
  });

  describe('formatDate', () => {
    it('renders "Mon D, YYYY"', () => {
      expect(formatDate(DEMO_TODAY)).toBe('Jun 4, 2026');
      expect(formatDate(new Date(2026, 0, 1))).toBe('Jan 1, 2026');
    });
  });

  describe('formatRelative', () => {
    it('labels days relative to DEMO_TODAY', () => {
      expect(formatRelative(DEMO_TODAY, DEMO_TODAY)).toBe('today');
      expect(formatRelative(new Date(2026, 5, 3), DEMO_TODAY)).toBe('yesterday');
      expect(formatRelative(new Date(2026, 5, 1), DEMO_TODAY)).toBe('3d ago');
      expect(formatRelative(new Date(2026, 4, 21), DEMO_TODAY)).toBe('2w ago');
      expect(formatRelative(new Date(2026, 5, 5), DEMO_TODAY)).toBe('tomorrow');
    });
  });

  describe('initials', () => {
    it('takes first + last initial, uppercased', () => {
      expect(initials('Ada Lovelace')).toBe('AL');
      expect(initials('grace hopper')).toBe('GH');
      expect(initials('Cher')).toBe('C');
      expect(initials('  ')).toBe('');
    });
  });
});
