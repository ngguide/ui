import { parseDate, parseTime } from './parse';

describe('parse', () => {
  describe('parseDate', () => {
    it('parses an ISO date', () => {
      const d = parseDate('2026-06-15', 'en-US');
      expect(d).toBeInstanceOf(Date);
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(5); // June
      expect(d?.getDate()).toBe(15);
    });

    it('parses a US M/D/Y date', () => {
      const d = parseDate('06/15/2026', 'en-US');
      expect(d).toBeInstanceOf(Date);
      expect(d?.getFullYear()).toBe(2026);
      expect(d?.getMonth()).toBe(5); // June
      expect(d?.getDate()).toBe(15);
    });

    it('returns null on garbage', () => {
      expect(parseDate('garbage', 'en-US')).toBeNull();
    });
  });

  describe('parseTime', () => {
    it('parses a 24h time', () => {
      expect(parseTime('14:30', false)).toEqual({ hours: 14, minutes: 30 });
    });

    it('parses a 12h pm time', () => {
      expect(parseTime('2:30 pm', true)).toEqual({ hours: 14, minutes: 30 });
    });

    it('rejects out-of-range hours', () => {
      expect(parseTime('25:00', false)).toBeNull();
    });
  });
});
