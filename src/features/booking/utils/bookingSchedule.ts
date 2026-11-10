import type { BookingPolicy } from "@/features/service/types/Service";

// For a cached service detail from a server that predates booking_policy.
export const DEFAULT_BOOKING_POLICY: BookingPolicy = {
  time_zone: "Asia/Ho_Chi_Minh",
  min_advance_minutes: 120,
  open_time: "08:00",
  last_start_time: "18:00",
};

const MINUTE_MS = 60_000;
export type BookingTimeRange = { min: number; max: number };
export type BookingFieldContext = {
  today: string;
  todayAvailable: boolean;
  timeRange: BookingTimeRange | null;
  minAdvanceMinutes: number;
};

export function parseBookingTime(value: unknown): number {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return NaN;
  }
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function formatBookingTime(minutes: number): string {
  const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour}:${minute}`;
}

function bookingClock(now: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (name: Intl.DateTimeFormatPartTypes) =>
    parts.find(({ type }) => type === name)?.value;
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    minute: Number(part("hour")) * 60 + Number(part("minute")),
  };
}

export function getBookingToday(policy: BookingPolicy, now = Date.now()): string {
  return bookingClock(now, policy.time_zone).date;
}

export function getBookingTimeRange(
  date: unknown,
  policy: BookingPolicy,
  now = Date.now(),
): BookingTimeRange | null {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  // The time picker submits minute precision. A start at HH:mm:00 must meet the full lead time.
  const earliest = Math.ceil(now / MINUTE_MS) * MINUTE_MS +
    policy.min_advance_minutes * MINUTE_MS;
  const first = bookingClock(earliest, policy.time_zone);
  if (date < first.date) return null;
  const open = parseBookingTime(policy.open_time);
  const max = parseBookingTime(policy.last_start_time);
  const min = date === first.date ? Math.max(open, first.minute) : open;
  return min <= max ? { min, max } : null;
}

export function isBookingTimeInRange(value: unknown, range: BookingTimeRange | null): boolean {
  const minutes = parseBookingTime(value);
  return !!range && minutes >= range.min && minutes <= range.max;
}
