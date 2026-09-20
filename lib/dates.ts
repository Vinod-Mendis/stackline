const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"] as const;

/**
 * Returns today's date formatted as "YYYY-MM-DD" using the user's local date
 * parts (getFullYear/getMonth/getDate) to avoid 1-day off-by-one errors in timezones ahead of UTC.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validates whether a string is a valid "YYYY-MM-DD" date.
 */
export function isValidDateString(str: unknown): str is string {
  if (typeof str !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const [y, m, d] = str.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/**
 * Parse a "YYYY-MM-DD" date string into a UTC Date object at 00:00:00.000.
 */
export function parseDateUTC(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Formats a Date object into "YYYY-MM-DD" using UTC values.
 */
export function formatDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Pure date math in UTC: adds given number of days to a "YYYY-MM-DD" string.
 */
export function addDaysUTC(dateStr: string, days: number): string {
  const date = parseDateUTC(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateUTC(date);
}

/**
 * Pure date math in UTC: returns number of whole days from startStr to endStr.
 * For example, diffDaysUTC("2026-09-01", "2026-09-02") is 1.
 */
export function diffDaysUTC(startStr: string, endStr: string): number {
  const startMs = parseDateUTC(startStr).getTime();
  const endMs = parseDateUTC(endStr).getTime();
  return Math.round((endMs - startMs) / 86_400_000);
}

/**
 * Returns the Monday of the week containing the given date in UTC.
 * (Monday is day 1, Sunday is day 0 in JS Date).
 */
export function getMondayOfWeekUTC(dateStr: string): string {
  const date = parseDateUTC(dateStr);
  const day = date.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysBackToMonday = day === 0 ? 6 : day - 1;
  return addDaysUTC(dateStr, -daysBackToMonday);
}

/**
 * Returns the single-letter weekday initial: "M", "T", "W", "T", "F", "S", "S".
 */
export function getWeekdayInitialUTC(dateStr: string): string {
  const day = parseDateUTC(dateStr).getUTCDay();
  return WEEKDAY_INITIALS[day];
}

/**
 * Returns true if the date is Saturday or Sunday in UTC.
 */
export function isWeekendUTC(dateStr: string): boolean {
  const day = parseDateUTC(dateStr).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Returns true if the date is Monday in UTC.
 */
export function isMondayUTC(dateStr: string): boolean {
  return parseDateUTC(dateStr).getUTCDay() === 1;
}

/**
 * Returns month label in UTC: "Sep 2026".
 */
export function formatMonthYearUTC(dateStr: string): string {
  const date = parseDateUTC(dateStr);
  return `${MONTH_SHORT_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Formats a duration into sentence-case label, e.g. "1 day", "3 days", "1 week", "2 weeks".
 */
export function formatDuration(amount: number, unit: "days" | "weeks"): string {
  if (amount === 1) {
    return unit === "weeks" ? "1 week" : "1 day";
  }
  return `${amount} ${unit}`;
}

/**
 * Formats a human-friendly date range for tooltips and headers.
 * e.g. "Sep 1 – 14, 2026" or "Sep 1, 2026 – Oct 5, 2026".
 */
export function formatDateRange(startStr: string, endStr: string): string {
  const startDate = parseDateUTC(startStr);
  const endDate = parseDateUTC(endStr);

  const startMonth = MONTH_SHORT_NAMES[startDate.getUTCMonth()];
  const startDay = startDate.getUTCDate();
  const startYear = startDate.getUTCFullYear();

  const endMonth = MONTH_SHORT_NAMES[endDate.getUTCMonth()];
  const endDay = endDate.getUTCDate();
  const endYear = endDate.getUTCFullYear();

  if (startStr === endStr) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
}
