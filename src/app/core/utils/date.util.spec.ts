import { daysUntil, formatDate, fromDateOnly, isDateOnly, toDateOnly, toInstant, toRequiredDateOnly } from './date.util';

/**
 * These specs are the regression net for the timezone bug this module was
 * written to fix: `new Date(2026, 7, 6).toISOString().slice(0, 10)` yields
 * '2026-08-05' east of UTC, and `new Date('2026-08-06')` renders as the 5th
 * west of UTC. Both round-trips only look correct when the test machine
 * happens to run in UTC, so the important assertions below are the ones that
 * construct a local Date and assert the calendar fields survive.
 */
describe('date.util', () => {
  describe('isDateOnly', () => {
    it('recognises the YYYY-MM-DD wire format', () => {
      expect(isDateOnly('2026-08-06')).toBe(true);
    });

    it('rejects full instants, empty strings and non-strings', () => {
      expect(isDateOnly('2026-08-06T10:30:00.000Z')).toBe(false);
      expect(isDateOnly('')).toBe(false);
      expect(isDateOnly(null)).toBe(false);
      expect(isDateOnly(new Date())).toBe(false);
    });
  });

  describe('toDateOnly', () => {
    it('keeps the calendar day the user picked, whatever the local offset', () => {
      // Local midnight on 6 August. toISOString() would move this to the 5th
      // for any positive UTC offset — that was the original defect.
      expect(toDateOnly(new Date(2026, 7, 6))).toBe('2026-08-06');
    });

    it('keeps the day for a late-evening local time', () => {
      // 23:30 local is the following day in UTC once the offset is negative.
      expect(toDateOnly(new Date(2026, 7, 6, 23, 30))).toBe('2026-08-06');
    });

    it('keeps the day for an early-morning local time', () => {
      expect(toDateOnly(new Date(2026, 7, 6, 0, 30))).toBe('2026-08-06');
    });

    it('zero-pads single-digit months and days', () => {
      expect(toDateOnly(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('returns null for absent or invalid dates', () => {
      expect(toDateOnly(null)).toBeNull();
      expect(toDateOnly(undefined)).toBeNull();
      expect(toDateOnly(new Date('nonsense'))).toBeNull();
    });
  });

  describe('fromDateOnly', () => {
    it('parses YYYY-MM-DD to local midnight, not UTC midnight', () => {
      const parsed = fromDateOnly('2026-08-06')!;
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(7);
      expect(parsed.getDate()).toBe(6);
      expect(parsed.getHours()).toBe(0);
    });

    it('round-trips through toDateOnly without drifting', () => {
      for (const iso of ['2026-01-01', '2026-08-06', '2026-12-31', '2024-02-29']) {
        expect(toDateOnly(fromDateOnly(iso))).toBe(iso);
      }
    });

    it('round-trips a picked Date without drifting', () => {
      const picked = new Date(2026, 7, 6);
      expect(fromDateOnly(toDateOnly(picked))!.getTime()).toBe(picked.getTime());
    });

    it('treats a full ISO instant as an instant', () => {
      const parsed = fromDateOnly('2026-08-06T12:00:00.000Z')!;
      expect(parsed.getTime()).toBe(Date.parse('2026-08-06T12:00:00.000Z'));
    });

    it('passes through a valid Date unchanged', () => {
      const input = new Date(2026, 7, 6, 9, 15);
      expect(fromDateOnly(input)).toBe(input);
    });

    it('returns null for empty, invalid and absent values', () => {
      expect(fromDateOnly('')).toBeNull();
      expect(fromDateOnly(null)).toBeNull();
      expect(fromDateOnly(undefined)).toBeNull();
      expect(fromDateOnly('not a date')).toBeNull();
      expect(fromDateOnly(new Date('nonsense'))).toBeNull();
    });
  });

  describe('toInstant', () => {
    it('serializes a moment in time to full ISO', () => {
      const instant = new Date(Date.UTC(2026, 7, 6, 12, 0, 0));
      expect(toInstant(instant)).toBe('2026-08-06T12:00:00.000Z');
    });

    it('returns null for absent or invalid dates', () => {
      expect(toInstant(null)).toBeNull();
      expect(toInstant(new Date('nonsense'))).toBeNull();
    });
  });

  describe('toRequiredDateOnly', () => {
    it('returns a plain string for a present date', () => {
      expect(toRequiredDateOnly(new Date(2026, 7, 6), 'Due Date')).toBe('2026-08-06');
    });

    it('throws naming the field rather than writing null to a required column', () => {
      expect(() => toRequiredDateOnly(null, 'Due Date')).toThrowError(/Due Date/);
    });
  });

  describe('formatDate', () => {
    it('formats a date-only value as the day it was saved', () => {
      // Pinned locale so the assertion does not depend on the runner's.
      expect(formatDate('2026-08-06', 'en-US')).toBe('8/6/2026');
    });

    it('returns null for unparseable input so callers choose the placeholder', () => {
      expect(formatDate('not a date')).toBeNull();
      expect(formatDate(null)).toBeNull();
    });
  });

  describe('daysUntil', () => {
    it('counts forward to a future calendar day', () => {
      const target = new Date();
      target.setDate(target.getDate() + 10);
      expect(daysUntil(toDateOnly(target))).toBe(10);
    });

    it('goes negative once the day has passed', () => {
      const target = new Date();
      target.setDate(target.getDate() - 3);
      expect(daysUntil(toDateOnly(target))).toBeLessThan(0);
    });

    it('reports today as not yet expired', () => {
      // The regression: parsing today's date-only value as UTC midnight put
      // it in the past for eastern offsets, so a certificate expiring today
      // was silently dropped from the "expiring soon" KPI.
      expect(daysUntil(toDateOnly(new Date()))).toBe(0);
    });

    it('returns null when there is no date', () => {
      expect(daysUntil(null)).toBeNull();
      expect(daysUntil('')).toBeNull();
    });
  });
});
