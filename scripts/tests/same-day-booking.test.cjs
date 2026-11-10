const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../../src/features/booking/utils/bookingSchedule.ts");
const loaded = new Module(filename, module);
loaded._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const {
  DEFAULT_BOOKING_POLICY,
  formatBookingTime,
  getBookingTimeRange,
  getBookingToday,
  isBookingTimeInRange,
} = loaded.exports;
const policy = DEFAULT_BOOKING_POLICY;
const today = "2026-11-10";
const tomorrow = "2026-11-11";
const at = (time) => Date.parse(`${today}T${time}+07:00`);

test("same-day choices include exactly two hours of lead time", () => {
  const range = getBookingTimeRange(today, policy, at("15:00:00"));
  assert.equal(formatBookingTime(range.min), "17:00");
  assert.equal(formatBookingTime(range.max), "18:00");
  assert.equal(isBookingTimeInRange("16:59", range), false);
  assert.equal(isBookingTimeInRange("17:00", range), true);
  assert.equal(isBookingTimeInRange("18:01", range), false);
  const after = getBookingTimeRange(today, policy, at("15:00:01"));
  assert.equal(formatBookingTime(after.min), "17:01");
});

test("18:00 is the only choice at 16:00 and tomorrow remains available after cutoff", () => {
  const range = getBookingTimeRange(today, policy, at("16:00:00"));
  assert.equal(range.min, range.max);
  assert.equal(formatBookingTime(range.min), "18:00");
  assert.equal(getBookingTimeRange(today, policy, at("16:00:01")), null);
  assert.equal(formatBookingTime(getBookingTimeRange(tomorrow, policy, at("16:01:00")).min), "08:00");
});

test("the booking timezone and configured lead time determine the available day and start", () => {
  assert.equal(getBookingToday(policy, Date.parse("2026-11-10T17:15:00Z")), tomorrow);
  const range = getBookingTimeRange(today, { ...policy, min_advance_minutes: 90 }, at("15:00:00"));
  assert.equal(formatBookingTime(range.min), "16:30");
  assert.equal(getBookingTimeRange(undefined, policy, at("15:00:00")), null);
});
