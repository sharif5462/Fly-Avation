/**
 * Timezone-safe handling of the two date shapes this app exchanges with the API.
 *
 * The distinction matters because JavaScript conflates them:
 *
 * - **date-only** (`YYYY-MM-DD`) — a calendar day with no time and no zone.
 *   A licence expiry, a work-order due date, a warranty end. "5 March" means
 *   5 March to everyone, everywhere.
 * - **instant** (full ISO 8601 with an offset) — a specific moment. A
 *   departure time, a bag scan. These are genuinely zone-dependent and
 *   `Date`/`toISOString()` handle them correctly.
 *
 * `p-datepicker` binds to a `Date`, which is always an instant at local
 * midnight for a date-only value. `toISOString()` then converts to UTC, which
 * moves the calendar day for every user east of UTC:
 *
 * ```
 * TZ=Asia/Dhaka   new Date(2026, 7, 6).toISOString().slice(0, 10) → '2026-08-05'
 * ```
 *
 * The reverse — `new Date('2026-08-06')` — parses as UTC midnight per spec,
 * which renders as the 5th for every user west of UTC. So the naive round-trip
 * loses a day in one direction or the other everywhere except UTC itself,
 * which is why it survived review.
 *
 * Use `toDateOnly` / `fromDateOnly` for date-only fields and leave instants to
 * `toISOString()`.
 */

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** True for the `YYYY-MM-DD` wire format, which must never go through UTC conversion. */
export function isDateOnly(value: unknown): value is string {
  return typeof value === 'string' && DATE_ONLY_PATTERN.test(value);
}

/**
 * Serializes a picker `Date` to `YYYY-MM-DD` using its **local** calendar
 * fields, so the day the user clicked is the day that gets stored.
 */
export function toDateOnly(value: Date | null | undefined): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/**
 * `toDateOnly` for a field the form marks `Validators.required`, so callers
 * get a `string` instead of `string | null`.
 *
 * Reaching the `null` branch means a required control was empty even though
 * `form.invalid` was checked first — a bug in the form wiring, not user input.
 * Throwing keeps that loud rather than PUTting `null` into a NOT NULL column
 * and getting a 500 back. (The `value!.toISOString()` this replaces threw a
 * bare TypeError in the same situation; this just says which field.)
 */
export function toRequiredDateOnly(value: Date | null | undefined, fieldName: string): string {
  const encoded = toDateOnly(value);
  if (encoded === null) {
    throw new Error(`Cannot save: required date field "${fieldName}" is empty.`);
  }
  return encoded;
}

/**
 * Parses a wire value back into a `Date` for the picker. A `YYYY-MM-DD` string
 * becomes **local** midnight (not UTC midnight), so it re-renders as the same
 * calendar day it was saved as. Anything else is treated as an instant.
 */
export function fromDateOnly(value: string | Date | null | undefined): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' || !value) return null;

  if (isDateOnly(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Serializes an instant (a real moment in time). Null-safe counterpart to `toDateOnly`. */
export function toInstant(value: Date | null | undefined): string | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  return value.toISOString();
}

/**
 * Formats a date-only or instant value for display, without the UTC shift.
 * Returns `null` for anything unparseable so callers can pick their own
 * placeholder rather than rendering "Invalid Date".
 */
export function formatDate(value: unknown, locale?: string): string | null {
  const parsed = fromDateOnly(value as string | Date | null);
  return parsed ? parsed.toLocaleDateString(locale) : null;
}

/** Formats an instant with its time component. Date-only input renders at local midnight. */
export function formatDateTime(value: unknown, locale?: string): string | null {
  const parsed = fromDateOnly(value as string | Date | null);
  return parsed ? parsed.toLocaleString(locale) : null;
}

/** Midnight at the start of the day `value` falls on, in local time. */
function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

/**
 * Whole **calendar days** from today until `value`: `0` for today, `1` for
 * tomorrow, negative once it has passed. Used by the expiry and overdue KPIs
 * on the dashboards.
 *
 * Deliberately compares midnight-to-midnight rather than subtracting raw
 * timestamps. A raw subtraction makes "expires today" a fraction of a day in
 * the past, so it rounds to a negative number and an asset whose certificate
 * lapses today drops out of the "expiring soon" count instead of topping it.
 * Rounding also absorbs the 23- and 25-hour days at DST transitions.
 */
export function daysUntil(value: string | Date | null | undefined): number | null {
  const parsed = fromDateOnly(value);
  if (!parsed) return null;
  const diffMs = startOfLocalDay(parsed).getTime() - startOfLocalDay(new Date()).getTime();
  return Math.round(diffMs / 86_400_000);
}
